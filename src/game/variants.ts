import { Square, ReserveFleet, Board } from "./engine";

export interface Variant {
  name: string;
  redReserve: ReserveFleet;
  blueReserve: ReserveFleet;
  board: Board;
}

export const B: Record<string, Square> = {
  HQ: { type: "HQ", player: "BLUE" },
  IN: { type: "INFANTRY", player: "BLUE" },
  AI: { type: "ARMORED_INFANTRY", player: "BLUE" },
  AB: { type: "AIRBORNE_INFANTRY", player: "BLUE" },
  AR: { type: "ARTILLERY", player: "BLUE", orientation: 180 },
  A1: { type: "ARTILLERY", player: "BLUE", orientation: 135 },
  AA: { type: "ARMORED_ARTILLERY", player: "BLUE", orientation: 180 },
  A2: { type: "ARMORED_ARTILLERY", player: "BLUE", orientation: 225 },
  HA: { type: "HEAVY_ARTILLERY", player: "BLUE", orientation: 180 },
  H1: { type: "HEAVY_ARTILLERY", player: "BLUE", orientation: 135 },
};

export const R: Record<string, Square> = {
  HQ: { type: "HQ", player: "RED" },
  IN: { type: "INFANTRY", player: "RED" },
  AI: { type: "ARMORED_INFANTRY", player: "RED" },
  AB: { type: "AIRBORNE_INFANTRY", player: "RED" },
  AR: { type: "ARTILLERY", player: "RED", orientation: 0 },
  A1: { type: "ARTILLERY", player: "RED", orientation: 45 },
  AA: { type: "ARMORED_ARTILLERY", player: "RED", orientation: 0 },
  HA: { type: "HEAVY_ARTILLERY", player: "RED", orientation: 0 },
  H1: { type: "HEAVY_ARTILLERY", player: "RED", orientation: 315 },
};

export const normandy: Variant = {
  name: "normandy",
  blueReserve: {
    INFANTRY: 8,
    ARMORED_INFANTRY: 8,
    AIRBORNE_INFANTRY: 2,
    ARTILLERY: 2,
    ARMORED_ARTILLERY: 1,
    HEAVY_ARTILLERY: 0,
  },
  redReserve: {
    INFANTRY: 4,
    ARMORED_INFANTRY: 2,
    AIRBORNE_INFANTRY: 0,
    ARTILLERY: 2,
    ARMORED_ARTILLERY: 0,
    HEAVY_ARTILLERY: 0,
  },
  board: [
    [B.HQ, B.IN, B.AI, B.IN, B.AI, B.IN, B.AI, B.HQ],
    [B.IN, null, null, null, null, null, null, B.IN],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, R.IN, null, R.IN, null, R.IN, null, R.IN],
    [R.HA, null, R.AR, null, R.AR, null, R.HA, R.HQ],
  ],
};

export const endgame: Variant = {
  name: "endgame",
  blueReserve: {
    INFANTRY: 0,
    ARMORED_INFANTRY: 0,
    AIRBORNE_INFANTRY: 0,
    ARTILLERY: 0,
    ARMORED_ARTILLERY: 0,
    HEAVY_ARTILLERY: 0,
  },
  redReserve: {
    INFANTRY: 0,
    ARMORED_INFANTRY: 0,
    AIRBORNE_INFANTRY: 0,
    ARTILLERY: 0,
    ARMORED_ARTILLERY: 0,
    HEAVY_ARTILLERY: 0,
  },
  board: [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, B.IN, null, null, null],
    [null, null, B.AR, B.AR, null, B.IN, null, null],
    [null, B.AI, null, null, null, null, null, null],
    [null, null, null, null, null, null, R.AI, null],
    [null, null, R.IN, null, R.AR, R.AR, null, null],
    [null, null, null, R.IN, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
};

export const variants: Record<string, Variant> = {
  normandy,
  endgame,
};
