import { Server, Origins, FlatFile } from "boardgame.io/server";
import { OnlineGHQGame } from "./game/engine";
import crypto from "crypto";
import { StorageAPI } from "boardgame.io";
import Koa from "koa";
import { createMatch } from "boardgame.io/src/server/util";
import { Game as SrcGame } from "boardgame.io/src/types"; // TODO(tyler): tech debt

interface Match {
  id: string;
  players: {
    "0": string;
    "1": string;
  };
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

  // TODO(tyler): need logic for removing users from userIdsToMatchIds when they leave a match

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
    const matchId = await createNewMatch({
      ctx,
      db: server.db,
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

    const match = { id: matchId, players: { "0": player1, "1": player2 } };
    userIdsToMatches[player1] = match;
    userIdsToMatches[player2] = match;
    ctx.body = JSON.stringify({ match });
    return;
  }

  // TODO(tyler): add auth credentials for the game

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

function newMatchId() {
  const id = crypto.randomBytes(16).toString("base64");
  return id.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

const createNewMatch = async ({
  ctx,
  db,
  ...opts
}: {
  db: StorageAPI.Sync | StorageAPI.Async;
  ctx: Koa.BaseContext;
} & Parameters<typeof createMatch>[0]): Promise<string> => {
  const matchID = newMatchId();
  const match = createMatch(opts);

  if ("setupDataError" in match) {
    ctx.throw(400, match.setupDataError);
    return "";
  } else {
    // @ts-expect-error: not sure yet
    await db.createMatch(matchID, match);
    return matchID;
  }
};
