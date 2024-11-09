import type { FnContext, Game, Move } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";

import { isAuthorizedToMovePiece } from "./move-logic";
import { clearBombardedSquares } from "@/game/capture-logic";
import { appendHistory, HistoryPlugin } from "./move-history-plugin";
import { getGameoverState } from "./gameover-logic";
import { coordinateToAlgebraic } from "./notation";

export const Units: {
  [key: string]: {
    mobility: 1 | 2;
    canCapture: boolean;
    artilleryRange?: number;
    canParachute?: true;
    imagePathPrefix: string;
  };
} = {
  HQ: { mobility: 1, canCapture: false, imagePathPrefix: "hq" },
  INFANTRY: {
    mobility: 1,
    canCapture: true,
    imagePathPrefix: "regular-infantry",
  },
  ARMORED_INFANTRY: {
    mobility: 2,
    canCapture: true,
    imagePathPrefix: "armored-infantry",
  },
  AIRBORNE_INFANTRY: {
    mobility: 1,
    canCapture: true,
    canParachute: true,
    imagePathPrefix: "paratrooper-infantry",
  },
  ARTILLERY: {
    mobility: 1,
    artilleryRange: 2,
    canCapture: false,
    imagePathPrefix: "regular-artillery",
  },
  ARMORED_ARTILLERY: {
    mobility: 2,
    artilleryRange: 2,
    canCapture: false,
    imagePathPrefix: "armored-artillery",
  },
  HEAVY_ARTILLERY: {
    mobility: 1,
    artilleryRange: 3,
    canCapture: false,
    imagePathPrefix: "heavy-artillery",
  },
};

export type UnitType = keyof typeof Units;

export type Orientation = 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;
export type Coordinate = [number, number];
export type Player = "RED" | "BLUE";

export type Square = {
  type: UnitType;
  player: Player;
  orientation?: Orientation;
} | null;

export type NonNullSquare = Exclude<Square, null>;

export type ReserveFleet = {
  INFANTRY: number;
  ARMORED_INFANTRY: number;
  AIRBORNE_INFANTRY: number;
  ARTILLERY: number;
  ARMORED_ARTILLERY: number;
  HEAVY_ARTILLERY: number;
};

export interface GHQState {
  isOnline?: boolean;
  matchId: string;
  userIds: {
    "0": string;
    "1": string;
  };
  elos: {
    "0": number;
    "1": number;
  };
  board: [
    [Square, Square, Square, Square, Square, Square, Square, Square],
    [Square, Square, Square, Square, Square, Square, Square, Square],
    [Square, Square, Square, Square, Square, Square, Square, Square],
    [Square, Square, Square, Square, Square, Square, Square, Square],
    [Square, Square, Square, Square, Square, Square, Square, Square],
    [Square, Square, Square, Square, Square, Square, Square, Square],
    [Square, Square, Square, Square, Square, Square, Square, Square],
    [Square, Square, Square, Square, Square, Square, Square, Square]
  ];
  redReserve: ReserveFleet;
  blueReserve: ReserveFleet;
  // time control
  redElapsed: number;
  blueElapsed: number;
  timeControl: number;
  bonusTime: number;
  startTime: number;
  turnStartTime: number;
  // draw state
  drawOfferedBy?: string;
  drawAcceptedBy?: string;
  // displaying moves from most recent turn
  lastTurnMoves: Record<"0" | "1", Coordinate[]>;
  lastTurnCaptures: Record<"0" | "1", Coordinate[]>;
}

export interface GameoverState {
  status: "WIN" | "DRAW";
  winner?: Player;
  reason: string;
}

const Reinforce: Move<GHQState> = (
  { G, ctx },
  unitType: keyof ReserveFleet,
  to: Coordinate
) => {
  const reserve = ctx.currentPlayer === "0" ? G.redReserve : G.blueReserve;

  if (reserve[unitType] === 0) {
    return INVALID_MOVE;
  }

  // decrement reserves
  reserve[unitType]--;

  if (ctx.currentPlayer === "0") {
    G.redReserve = reserve;
  } else {
    G.blueReserve = reserve;
  }

  // spawn
  const s: NonNullSquare = {
    type: unitType,
    player: ctx.currentPlayer === "0" ? "RED" : "BLUE",
    orientation: unitType.includes("ARTILLERY")
      ? ctx.currentPlayer === "0"
        ? 0
        : 180
      : undefined,
  };
  G.board[to[0]][to[1]] = s;

  G.lastTurnMoves[ctx.currentPlayer as "0" | "1"].push(to);
};
const Move: Move<GHQState> = (
  { G, ctx, log, ...plugins },
  from: Coordinate,
  to: Coordinate,
  capturePreference?: Coordinate
) => {
  const piece = G.board[from[0]][from[1]];
  if (!isAuthorizedToMovePiece(ctx, piece)) {
    return INVALID_MOVE;
  }

  G.board[from[0]][from[1]] = null;
  G.board[to[0]][to[1]] = piece;

  G.lastTurnMoves[ctx.currentPlayer as "0" | "1"].push(to);

  let capturedPieceType: UnitType | undefined;

  if (capturePreference) {
    capturedPieceType =
      G.board[capturePreference[0]][capturePreference[1]]?.type;
    G.board[capturePreference[0]][capturePreference[1]] = null;
    G.lastTurnCaptures[ctx.currentPlayer as "0" | "1"].push(capturePreference);
  }

  log.setMetadata({
    pieceType: piece?.type,
    capturePreference,
    capturedPieceType,
  });
};

const MoveAndOrient: Move<GHQState> = (
  { G, ctx, log },
  from: Coordinate,
  to: Coordinate,
  orientation?: Orientation
) => {
  const piece = G.board[from[0]][from[1]]!;
  if (typeof Units[piece.type].artilleryRange === "undefined") {
    return INVALID_MOVE;
  }
  if (!isAuthorizedToMovePiece(ctx, piece)) {
    return INVALID_MOVE;
  }

  piece!.orientation = orientation;
  G.board[from[0]][from[1]] = null;
  G.board[to[0]][to[1]] = piece;
  G.lastTurnMoves[ctx.currentPlayer as "0" | "1"].push(to);
  log.setMetadata({ pieceType: piece?.type });
};
const ChangeOrientation: Move<GHQState> = (
  { G, ctx, log },
  on: Coordinate,
  orientation: Orientation
) => {
  const piece = G.board[on[0]][on[1]];
  if (!isAuthorizedToMovePiece(ctx, piece)) {
    return INVALID_MOVE;
  }

  piece!.orientation = orientation;
  G.board[on[0]][on[1]] = piece;
  G.lastTurnMoves[ctx.currentPlayer as "0" | "1"].push(on);
  log.setMetadata({ pieceType: piece?.type });
};

const Skip: Move<GHQState> = ({ G, ctx, events }) => {
  events.endTurn();
};

const Resign: Move<GHQState> = ({ G, ctx, events }) => {
  const gameover: GameoverState = {
    status: "WIN",
    winner: ctx.currentPlayer === "0" ? "BLUE" : "RED",
    reason: "by resignation",
  };
  events.endGame(gameover);
};

const OfferDraw: Move<GHQState> = {
  noLimit: true,
  move: ({ G, ctx }, offered: boolean) => {
    if (offered) {
      G.drawOfferedBy = ctx.currentPlayer;
    } else {
      G.drawOfferedBy = undefined;
    }
  },
};

const AcceptDraw: Move<GHQState> = {
  noLimit: true,
  move: ({ G, ctx, events }) => {
    if (!G.drawOfferedBy || G.drawOfferedBy === ctx.currentPlayer) {
      return INVALID_MOVE;
    }

    G.drawAcceptedBy = ctx.currentPlayer;
    const gameover: GameoverState = {
      status: "DRAW",
      reason: "draw accepted",
    };
    events.endGame(gameover);
  },
};

export const GameMoves = {
  Reinforce,
  Move,
  ChangeOrientation,
  MoveAndOrient,
  Skip,
  Resign,
  OfferDraw,
  AcceptDraw,
};

export type GameMoveType = typeof GameMoves;

export const GHQGame: Game<GHQState> = {
  plugins: [HistoryPlugin],
  setup: ({ ctx, ...plugins }, setupData) => {
    return {
      startTime: Date.now(),
      turnStartTime: Date.now(),
      blueElapsed: 0,
      redElapsed: 0,
      bonusTime: 5 * 1000,
      timeControl: 10 * 60 * 1000,
      board: [
        [
          { type: "HQ", player: "BLUE" },
          { type: "ARTILLERY", player: "BLUE", orientation: 180 },
          null,
          null,
          null,
          null,
          null,
          null,
        ],
        [
          { type: "INFANTRY", player: "BLUE" },
          { type: "INFANTRY", player: "BLUE" },
          { type: "INFANTRY", player: "BLUE" },
          null,
          null,
          null,
          null,
          null,
        ],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [
          null,
          null,
          null,
          null,
          null,
          { type: "INFANTRY", player: "RED" },
          { type: "INFANTRY", player: "RED" },
          { type: "INFANTRY", player: "RED" },
        ],
        [
          null,
          null,
          null,
          null,
          null,
          null,
          { type: "ARTILLERY", player: "RED", orientation: 0 },
          { type: "HQ", player: "RED" },
        ],
      ],
      redReserve: {
        INFANTRY: 5,
        ARMORED_INFANTRY: 3,
        AIRBORNE_INFANTRY: 1,
        ARTILLERY: 2,
        ARMORED_ARTILLERY: 1,
        HEAVY_ARTILLERY: 1,
      },
      blueReserve: {
        INFANTRY: 5,
        ARMORED_INFANTRY: 3,
        AIRBORNE_INFANTRY: 1,
        ARTILLERY: 2,
        ARMORED_ARTILLERY: 1,
        HEAVY_ARTILLERY: 1,
      },
      userIds: {
        "0": setupData?.players?.["0"] || "Player 1",
        "1": setupData?.players?.["1"] || "Player 2",
      },
      elos: {
        "0": setupData?.elos?.["0"] || 1000,
        "1": setupData?.elos?.["1"] || 1000,
      },
      matchId: setupData?.matchId || "",
      lastTurnMoves: {
        "0": [],
        "1": [],
      },
      lastTurnCaptures: {
        "0": [],
        "1": [],
      },
    };
  },
  turn: {
    maxMoves: 3,
    onBegin: ({ ctx, G, random, ...plugins }) => {
      G.lastTurnMoves[ctx.currentPlayer as "0" | "1"] = [];
      G.lastTurnCaptures[ctx.currentPlayer as "0" | "1"] = [];

      const clearedSqures = clearBombardedSquares(G, ctx);
      if (clearedSqures.length > 0) {
        G.lastTurnCaptures[ctx.currentPlayer as "0" | "1"].push(
          ...clearedSqures
        );

        const player = ctx.currentPlayer === "0" ? "Red" : "Blue";
        appendHistory(plugins, {
          isCapture: true,
          turn: ctx.turn,
          message: `[${ctx.turn}]: ${player} artillery destroyed piece${
            clearedSqures.length > 1 ? "s" : ""
          } at ${clearedSqures
            .map((coord) => coordinateToAlgebraic(coord))
            .join(", ")}`,
        });
      }
      G.turnStartTime = Date.now();
    },
    onEnd: ({ ctx, G }) => {
      const elapsed = Date.now() - G.turnStartTime;
      if (ctx.currentPlayer === "0") {
        G.redElapsed = G.redElapsed + elapsed - G.bonusTime;
      } else {
        G.blueElapsed = G.blueElapsed + elapsed - G.bonusTime;
      }
    },
  },
  endIf: ({ G }) => {
    return getGameoverState(G);
  },
  minPlayers: 2,
  maxPlayers: 2,
  moves: GameMoves,
};

export function newOnlineGHQGame({
  onEnd,
}: {
  onEnd?: (args: FnContext<GHQState>) => void | GHQState;
}): Game<GHQState> {
  const game = { ...GHQGame };

  const oldSetup = game.setup;
  game.setup = ({ ctx, ...plugins }, setupData): GHQState => {
    if (!oldSetup) throw new Error("No setup function found");
    const state = oldSetup({ ctx, ...plugins }, setupData);
    state.isOnline = true;
    return state;
  };

  game.validateSetupData = (setupData, numPlayers) => {
    if (numPlayers !== 2) {
      return "Invalid number of players";
    }
    if (setupData) {
      if (!setupData.players["0"] || !setupData.players["1"]) {
        return "Missing player IDs";
      }
      if (!setupData.matchId) {
        return "Missing match ID";
      }
    }
  };

  if (onEnd) {
    game.onEnd = (args) => onEnd(args);
  }

  return game;
}
