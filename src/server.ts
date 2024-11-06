require("dotenv").config();
import { Server, Origins, FlatFile } from "boardgame.io/server";
import { GameoverState, GHQState, newOnlineGHQGame } from "./game/engine";
import { StorageAPI } from "boardgame.io";
import Koa from "koa";
import { createMatch } from "boardgame.io/src/server/util";
import { Game as SrcGame } from "boardgame.io/src/types"; // TODO(tyler): tech debt
import { nanoid } from "nanoid";
import { createClient } from "@supabase/supabase-js";
import { PostgresStore } from "bgio-postgres";
import { calculateElo } from "./game/elo";

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
  origins: [Origins.LOCALHOST, "https://www.playghq.com"],
  db,
});

const queue: Set<string> = new Set<string>();

server.router.post("/matchmaking", async (ctx) => {
  const url = new URL(ctx.request.url, `http://${ctx.request.headers.host}`);
  const userId = url.searchParams.get("userId"); // TODO(tyler): get this from auth later
  if (!userId) {
    throw new Error("userId is required");
  }

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

    const user0 = await getOrCreateUser(player0);
    const user1 = await getOrCreateUser(player1);

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
        elos: {
          "0": user0.elo,
          "1": user1.elo,
        },
      },
      unlisted: false,
      game: ghqGame as SrcGame,
    });
    if (!newMatch) {
      return;
    }
    const { matchId, player0Creds, player1Creds } = newMatch;
    await createActiveMatches({
      matchId,
      user0,
      user1,
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
  user0,
  user1,
  player0Creds,
  player1Creds,
}: {
  matchId: string;
  user0: User;
  user1: User;
  player0Creds: string;
  player1Creds: string;
}): Promise<void> {
  const { error } = await supabase.from("active_user_matches").insert([
    {
      user_id: user0.id,
      match_id: matchId,
      player_id: "0",
      credentials: player0Creds,
    },
    {
      user_id: user1.id,
      match_id: matchId,
      player_id: "1",
      credentials: player1Creds,
    },
  ]);
  if (error) throw error;

  const { error: matchError } = await supabase.from("matches").insert([
    {
      id: matchId,
      player0_id: user0.id,
      player1_id: user1.id,
      player0_elo: user0.elo,
      player1_elo: user1.elo,
    },
  ]);
  if (matchError) throw matchError;
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

  const { status, winner } = ctx.gameover as GameoverState;
  const player0Id = G.userIds["0"];
  const player1Id = G.userIds["1"];
  const winnerId = winner === "RED" ? player0Id : player1Id;

  // Update match with winner and status
  supabase
    .from("matches")
    .update({ winner_id: winnerId, status })
    .eq("id", matchId)
    .then(({ error }) => {
      if (error) {
        console.log({
          message: "Error updating matches table",
          matchId,
          winnerId,
          status,
          error,
        });
      }
    });

  // Update user elos

  const player0Elo = calculateElo(
    G.elos["0"],
    G.elos["1"],
    status === "DRAW" ? 0.5 : winner === "RED" ? 1 : 0
  );

  supabase
    .from("users")
    .update({ elo: player0Elo })
    .eq("id", player0Id)
    .then(({ error }) => {
      if (error) {
        console.log({
          message: "Error updating winner's elo",
          winnerId,
          error,
        });
      }
    });

  const player1Elo = calculateElo(
    G.elos["1"],
    G.elos["0"],
    status === "DRAW" ? 0.5 : winner === "BLUE" ? 1 : 0
  );

  supabase
    .from("users")
    .update({ elo: player1Elo })
    .eq("id", player1Id)
    .then(({ error }) => {
      if (error) {
        console.log({
          message: "Error updating loser's elo",
          player1Id,
          error,
        });
      }
    });
}

interface User {
  id: string;
  elo: number;
}

async function getOrCreateUser(userId: string): Promise<User> {
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, elo")
    .eq("id", userId)
    .single();

  if (user) {
    return user;
  }

  if (userError && userError.code === "PGRST116") {
    const newUser = { id: userId, elo: 1000 };
    const { error: insertError } = await supabase
      .from("users")
      .insert([newUser]);

    if (insertError) throw insertError;
    return newUser;
  } else if (userError) {
    throw userError;
  }

  throw new Error("Unexpected error");
}
