import type { Ctx, Game, Move, State } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";
import { PluginPlayer } from "boardgame.io/plugins";
import { bombardedSquares } from "./move-logic";
import { playMoveSound } from "./audio";

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
  userIds: {
    "0": string;
    "1": string;
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
};
const Move: Move<GHQState> = (
  { G, ctx },
  from: Coordinate,
  to: Coordinate,
  capturePreference?: Coordinate
) => {
  const piece = G.board[from[0]][from[1]];
  G.board[from[0]][from[1]] = null;
  G.board[to[0]][to[1]] = piece;
  playMoveSound(); // TODO(tyler): figure out where this should go
};

const MoveAndOrient: Move<GHQState> = (
  { G, ctx },
  from: Coordinate,
  to: Coordinate,
  orientation?: Orientation
) => {
  const piece = G.board[from[0]][from[1]]!;
  if (typeof Units[piece.type].artilleryRange === "undefined") {
    return INVALID_MOVE;
  }

  piece!.orientation = orientation;
  G.board[from[0]][from[1]] = null;
  G.board[to[0]][to[1]] = piece;
};
const ChangeOrientation: Move<GHQState> = (
  { G, ctx },
  on: Coordinate,
  orientation: Orientation
) => {
  const piece = G.board[on[0]][on[1]];
  piece!.orientation = orientation;
  G.board[on[0]][on[1]] = piece;
};

const Skip: Move<GHQState> = ({ G, ctx, events }) => {
  events.endTurn();
};

const clearBombardedSquares = (G: GHQState, ctx: Ctx) => {
  const bombarded = bombardedSquares(G.board);

  G.board.forEach((rows, x) => {
    rows.forEach((square, y) => {
      const bombardedSquare = bombarded[`${x},${y}`];

      // If there is nothing here or it's not bombarded, do nothing.
      if (!square || !bombardedSquare) {
        return;
      }

      // If it's our turn, and we bombard the square, and the square is occupied by an enemy piece, remove it.
      const currentPlayerColor = ctx.currentPlayer === "0" ? "RED" : "BLUE";
      if (
        bombardedSquare[currentPlayerColor] &&
        square.player !== currentPlayerColor
      ) {
        G.board[x][y] = null;
      }
    });
  });

  // TODO: add log message for user indicating that a bombarded piece was destroyed
};

export const GameMoves = {
  Reinforce,
  Move,
  ChangeOrientation,
  MoveAndOrient,
  Skip,
};

export type GameMoveType = typeof GameMoves;

export const GHQGame: Game<GHQState> = {
  setup: ({ ctx, ...plugins }, setupData) => {
    return {
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
    };
  },
  turn: {
    maxMoves: 3,
    onBegin: ({ G, ctx, events, random, ...plugins }) => {
      clearBombardedSquares(G, ctx);
    },
  },
  minPlayers: 2,
  maxPlayers: 2,
  moves: GameMoves,
};

export const OnlineGHQGame: Game<GHQState> = (() => {
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
    if (!setupData.players["0"] || !setupData.players["1"]) {
      return "Missing player IDs";
    }
  };
  return game;
})();
