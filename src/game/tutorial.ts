import type { Game } from "boardgame.io";

import { GHQGame, GHQState, Square } from "./engine";

const B: Record<string, Square> = {
  HQ: { type: "HQ", player: "BLUE" },
  IN: { type: "INFANTRY", player: "BLUE" },
  AI: { type: "ARMORED_INFANTRY", player: "BLUE" },
  AB: { type: "AIRBORNE_INFANTRY", player: "BLUE" },
  AR: { type: "ARTILLERY", player: "BLUE", orientation: 180 },
  AA: { type: "ARMORED_ARTILLERY", player: "BLUE", orientation: 180 },
  HA: { type: "HEAVY_ARTILLERY", player: "BLUE", orientation: 180 },
};

const R: Record<string, Square> = {
  HQ: { type: "HQ", player: "RED" },
  IN: { type: "INFANTRY", player: "RED" },
  AI: { type: "ARMORED_INFANTRY", player: "RED" },
  AB: { type: "AIRBORNE_INFANTRY", player: "RED" },
  AR: { type: "ARTILLERY", player: "RED", orientation: 0 },
  AA: { type: "ARMORED_ARTILLERY", player: "RED", orientation: 0 },
  HA: { type: "HEAVY_ARTILLERY", player: "RED", orientation: 0 },
};

export const boards: Record<string, GHQState["board"]> = {
  "Infantry capture infantry": [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, B.IN, null, null, null, null],
    [null, null, null, R.IN, R.IN, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  "Armored infantry capture infantry": [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, B.IN, null, null, null, null],
    [null, null, null, R.IN, B.IN, null, null, null],
    [null, null, R.AI, null, R.IN, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  "Infantry capture artillery": [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, B.AR, null, R.IN, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  "Infantry capture defended artillery": [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, R.IN, null, null, null, null],
    [null, null, null, null, B.IN, null, null, null],
    [null, null, null, B.AR, R.IN, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  "Artillery capture infantry": [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, B.IN, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, R.AR, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  "Artillery capture artillery": [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, B.AR, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, R.HA, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  "Airborne capture artillery": [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, B.HA, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, R.AB, null, null, null, R.HQ],
  ],
  "Airborne capture infantry": [
    [B.HQ, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, B.IN, null, null, null],
    [null, null, null, null, R.IN, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, R.AB, null, null, null, R.HQ],
  ],
  "Infantry capture HQ": [
    [B.HQ, null, R.IN, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, R.IN, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
  "Infantry capture defended HQ": [
    [B.HQ, null, R.IN, R.IN, null, null, null, null],
    [null, B.IN, null, null, null, null, null, null],
    [null, R.IN, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, R.HQ],
  ],
};

export type BoardType = keyof typeof boards;

export function newTutorialGHQGame({
  boardType,
}: {
  boardType: BoardType;
}): Game<GHQState> {
  const game = { ...GHQGame };

  game.setup = ({ ctx }, setupData) => {
    return {
      startTime: Date.now(),
      turnStartTime: Date.now(),
      blueElapsed: 0,
      redElapsed: 0,
      bonusTime: 5 * 1000,
      timeControl: 100 * 60 * 1000,
      board: boards[boardType],
      redReserve: {
        INFANTRY: 99,
        ARMORED_INFANTRY: 99,
        AIRBORNE_INFANTRY: 99,
        ARTILLERY: 99,
        ARMORED_ARTILLERY: 99,
        HEAVY_ARTILLERY: 99,
      },
      blueReserve: {
        INFANTRY: 99,
        ARMORED_INFANTRY: 99,
        AIRBORNE_INFANTRY: 99,
        ARTILLERY: 99,
        ARMORED_ARTILLERY: 99,
        HEAVY_ARTILLERY: 99,
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
  };

  return game;
}
