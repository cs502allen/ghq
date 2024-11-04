import { Server, Origins, FlatFile } from "boardgame.io/server";
import { OnlineGHQGame } from "./game/engine";
import crypto from "crypto";
import { StorageAPI } from "boardgame.io";
import Koa from "koa";
import { createMatch } from "boardgame.io/src/server/util";
import { Game as SrcGame } from "boardgame.io/src/types"; // TODO(tyler): tech debt
import { nanoid } from "nanoid";

interface Match {
  id: string;
  players: {
    "0": string;
    "1": string;
  };
  credentials: string;
}

const server = Server({
  games: [OnlineGHQGame],
  origins: [Origins.LOCALHOST],
  db: new FlatFile({
    dir: ".data/flatfiledb",
  }),
});

const queue: Set<string> = new Set<string>();
const userIdsToMatches: Record<string, Match> = {};

server.router.post("/matchmaking", async (ctx) => {
  const url = new URL(ctx.request.url, `http://${ctx.request.headers.host}`);
  const userId = url.searchParams.get("userId"); // TODO(tyler): get this from auth later
  if (!userId) {
    throw new Error("userId is required");
  }

  // TODO(tyler): after game ends, remove users from userIdsToMatchIds
  // TODO(tyler): after game finishes, update user elos

  // If user is already in a match, return the match id
  const existingMatch = userIdsToMatches[userId];
  if (existingMatch) {
    ctx.body = JSON.stringify({ match: existingMatch });
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
    const [player1, player2] = queue.values();
    queue.delete(player1);
    queue.delete(player2);
    console.log("Creating match with players", player1, player2);

    const newMatch = await createNewMatch({
      ctx,
      db: server.db,
      player1,
      player2,
      numPlayers: 2,
      setupData: {
        players: {
          "0": player1,
          "1": player2,
        },
      },
      unlisted: false,
      game: OnlineGHQGame as SrcGame,
    });
    if (!newMatch) {
      return;
    }
    const { matchId, player1Credentials, player2Credentials } = newMatch;

    const match = { id: matchId, players: { "0": player1, "1": player2 } };
    userIdsToMatches[player1] = { ...match, credentials: player1Credentials };
    userIdsToMatches[player2] = { ...match, credentials: player2Credentials };
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
  player1Credentials: string;
  player2Credentials: string;
}

const createNewMatch = async ({
  ctx,
  db,
  player1,
  player2,
  ...opts
}: {
  db: StorageAPI.Sync | StorageAPI.Async;
  player1: string;
  player2: string;
  ctx: Koa.BaseContext;
} & Parameters<typeof createMatch>[0]): Promise<CreatedMatch | null> => {
  const matchId = nanoid();
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

    const player1Credentials = nanoid();
    const player2Credentials = nanoid();

    metadata.players["0"].name = player1;
    metadata.players["0"].credentials = player1Credentials;
    metadata.players["1"].name = player2;
    metadata.players["1"].credentials = player2Credentials;

    await db.setMetadata(matchId, metadata);

    return { matchId, player1Credentials, player2Credentials };
  }
};

(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const { metadata } = await server.db.fetch("Bor2CHvlw_lKMrnVDCZ-m", {
    metadata: true,
  });
  console.log(metadata);
})();
