require("dotenv").config();
import { Server, Origins, FlatFile } from "boardgame.io/server";
import { GHQState, newOnlineGHQGame } from "./game/engine";
import { StorageAPI } from "boardgame.io";
import Koa from "koa";
import { createMatch } from "boardgame.io/src/server/util";
import { Game as SrcGame } from "boardgame.io/src/types"; // TODO(tyler): tech debt
import { nanoid } from "nanoid";
import { createClient } from "@supabase/supabase-js";
import { PostgresStore } from "bgio-postgres";

const supabase = createClient(
  "https://wjucmtrnmjcaatbtktxo.supabase.co",
  process.env.SUPABASE_SECRET_KEY!
);

const ghqGame = newOnlineGHQGame({ onEnd: onGameEnd });

const db = new PostgresStore({
  database: "postgres",
  username: "postgres.wjucmtrnmjcaatbtktxo",
  password: process.env.POSTGRES_PASSWORD,
  host: "aws-0-us-east-2.pooler.supabase.com",
  port: 6543,
});

const server = Server({
  games: [ghqGame],
  origins: [Origins.LOCALHOST],
  db,
});

const queue: Set<string> = new Set<string>();

server.router.post("/matchmaking", async (ctx) => {
  const url = new URL(ctx.request.url, `http://${ctx.request.headers.host}`);
  const userId = url.searchParams.get("userId"); // TODO(tyler): get this from auth later
  if (!userId) {
    throw new Error("userId is required");
  }

  // TODO(tyler): create `users` table row with 1000 elo if it doesn't exist

  // If user is already in a match, return the match id
  const activeMatch = await getActiveMatch(userId);
  if (activeMatch) {
    ctx.body = JSON.stringify({ match: activeMatch });
    return;
  }

  if (!queue.has(userId)) {
    console.log("Adding user to queue", userId);
    queue.add(userId);
    console.log("Users in queue", queue);
  }

  // TODO(tyler): mark users as stale in queue every 5 seconds, have them have to constantly refresh to stay in queue

  // TODO(tyler): more complex matchmaking logic

  if (queue.size >= 2) {
    const [player0, player1] = queue.values();
    queue.delete(player0);
    queue.delete(player1);
    console.log("Creating match with players", player0, player1);

    const newMatch = await createNewMatch({
      ctx,
      db: server.db,
      player0,
      player1,
      numPlayers: 2,
      setupData: {
        players: {
          "0": player0,
          "1": player1,
        },
      },
      unlisted: false,
      game: ghqGame as SrcGame,
    });
    if (!newMatch) {
      return;
    }
    const { matchId, player0Creds, player1Creds } = newMatch;
    // TODO(tyler): create `matches` table row
    await createActiveMatches({
      matchId,
      player0,
      player1,
      player0Creds,
      player1Creds,
    });

    ctx.body = JSON.stringify({});
    return;
  }

  ctx.body = JSON.stringify({});
});

server.router.delete("/matchmaking", (ctx) => {
  const url = new URL(ctx.request.url, `http://${ctx.request.headers.host}`);
  const userId = url.searchParams.get("userId"); // TODO(tyler): get this from auth later
  if (!userId) {
    throw new Error("userId is required");
  }

  queue.delete(userId);

  ctx.body = JSON.stringify({});
});

server.router.get("/matches", async (ctx) => {
  const allLiveMatches = await server.db.listMatches({
    where: { isGameover: false },
  });

  const matches = await Promise.all(
    allLiveMatches.slice(0, 10).map(async (matchId) => {
      const res = await server.db.fetch(matchId, { state: true });
      return { ...res, id: matchId };
    })
  );

  ctx.body = JSON.stringify({ matches });
});

server.run(8000);

interface CreatedMatch {
  matchId: string;
  player0Creds: string;
  player1Creds: string;
}

const createNewMatch = async ({
  ctx,
  db,
  player0,
  player1,
  ...opts
}: {
  db: StorageAPI.Sync | StorageAPI.Async;
  player0: string;
  player1: string;
  ctx: Koa.BaseContext;
} & Parameters<typeof createMatch>[0]): Promise<CreatedMatch | null> => {
  const matchId = nanoid();

  opts.setupData.matchId = matchId;

  const match = createMatch(opts);

  if ("setupDataError" in match) {
    ctx.throw(400, match.setupDataError);
    return null;
  } else {
    // @ts-expect-error: not sure yet
    await db.createMatch(matchId, match);

    const { metadata } = await db.fetch(matchId, {
      metadata: true,
    });
    if (!metadata) {
      ctx.throw(404, "Match " + matchId + " not found");
      return null;
    }

    const player0Creds = nanoid();
    const player1Creds = nanoid();

    metadata.players["0"].name = player0;
    metadata.players["0"].credentials = player0Creds;
    metadata.players["1"].name = player1;
    metadata.players["1"].credentials = player1Creds;

    await db.setMetadata(matchId, metadata);

    return { matchId, player0Creds, player1Creds };
  }
};

async function createActiveMatches({
  matchId,
  player0,
  player1,
  player0Creds,
  player1Creds,
}: {
  matchId: string;
  player0: string;
  player1: string;
  player0Creds: string;
  player1Creds: string;
}): Promise<void> {
  const { error } = await supabase.from("active_user_matches").insert([
    {
      user_id: player0,
      match_id: matchId,
      player_id: "0",
      credentials: player0Creds,
    },
    {
      user_id: player1,
      match_id: matchId,
      player_id: "1",
      credentials: player1Creds,
    },
  ]);
  if (error) throw error;
}

interface ActiveMatch {
  id: string;
  playerId: "0" | "1";
  credentials: string;
}

async function getActiveMatch(userId: string): Promise<ActiveMatch | null> {
  const { data, error } = await supabase
    .from("active_user_matches")
    .select("match_id, player_id, credentials")
    .eq("user_id", userId)
    .single();
  if (error) return null;

  return {
    id: data?.match_id || "",
    playerId: data?.player_id,
    credentials: data?.credentials,
  };
}

function onGameEnd({ ctx, G }: { ctx: any; G: GHQState }): void | GHQState {
  const matchId = G.matchId;
  for (const userId of Object.values(G.userIds)) {
    supabase
      .from("active_user_matches")
      .delete()
      .eq("user_id", userId)
      .eq("match_id", matchId)
      .then(({ data, error }) => {
        if (error)
          console.log({
            message: "Error deleting active_user_matches",
            userId,
            matchId,
            error,
          });
      });
  }

  // TODO(tyler): update `matches` table with game result
  // TODO(tyler): update `users` table with elo changes
}
