import type { Game, Move } from "boardgame.io";

export const Units: {
  [key: string]: {
    mobility: 1 | 2;
    canCapture: boolean;
    artilleryRange?: number;
    canParachute?: true;
  };
} = {
  HQ: { mobility: 1, canCapture: false },
  INFANTRY: { mobility: 1, canCapture: true },
  ARMORED_INFANTRY: { mobility: 2, canCapture: true },
  AIRBORNE_INFANTRY: { mobility: 1, canCapture: true, canParachute: true },
  ARTILLERY: { mobility: 1, artilleryRange: 2, canCapture: false },
  ARMORED_ARTILLERY: { mobility: 2, artilleryRange: 2, canCapture: false },
  HEAVY_ARTILLERY: { mobility: 1, artilleryRange: 3, canCapture: false },
};

export type UnitType = keyof typeof Units;

type Orientation = 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;
export type Coordinate = [number, number];
type Color = "RED" | "BLUE";

export type Square = {
  type: UnitType;
  player: Color;
  orientation?: Orientation;
} | null;

type ReserveFleet = {
  INFANTRY: number;
  ARMORED_INFANTRY: number;
  AIRBORNE_INFANTRY: number;
  ARTILLERY: number;
  ARMORED_ARTILLERY: number;
  HEAVY_ARTILLERY: number;
};

export interface GHQState {
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
  unitType: UnitType,
  to: Coordinate
) => {};
const Move: Move<GHQState> = (
  { G, ctx },
  from: Coordinate,
  to: Coordinate,
  orientation?: Orientation,
  capturePreference?: Coordinate
) => {
  console.log(from, to);
};
const ChangeOrientation: Move<GHQState> = (
  { G, ctx },
  on: Coordinate,
  orientation: Orientation
) => {};
const Skip: Move<GHQState> = ({ G, ctx, events }) => {
  events.endTurn();
};

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
    };
  },
  turn: {
    maxMoves: 3,
  },
  minPlayers: 2,
  maxPlayers: 2,
  moves: {
    Reinforce,
    Move,
    ChangeOrientation,
    Skip,
  },
};
