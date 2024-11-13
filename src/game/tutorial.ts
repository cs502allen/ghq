import type { Game } from "boardgame.io";

import { GHQGame, GHQState, Square } from "./engine";
import { BoardArrowType } from "./BoardArrow";

const B: Record<string, Square> = {
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

const R: Record<string, Square> = {
  HQ: { type: "HQ", player: "RED" },
  IN: { type: "INFANTRY", player: "RED" },
  AI: { type: "ARMORED_INFANTRY", player: "RED" },
  AB: { type: "AIRBORNE_INFANTRY", player: "RED" },
  AR: { type: "ARTILLERY", player: "RED", orientation: 0 },
  AA: { type: "ARMORED_ARTILLERY", player: "RED", orientation: 0 },
  HA: { type: "HEAVY_ARTILLERY", player: "RED", orientation: 0 },
};

export interface TutorialSetupData {
  board: GHQState["board"];
  isPuzzle: boolean;
  boardArrows: BoardArrowType[];
}

export const boards: Record<string, TutorialSetupData> = {
  "Infantry capture infantry": {
    board: [
      [B.HQ, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, B.IN, null, null, null, null],
      [null, null, null, R.IN, R.IN, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, R.HQ],
    ],
    isPuzzle: false,
    boardArrows: [{ from: [4, 4], to: [3, 4] }],
  },
  "Armored infantry capture infantry": {
    board: [
      [B.HQ, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, B.IN, null, null, null, null],
      [null, null, null, R.IN, B.IN, null, null, null],
      [null, null, R.AI, null, R.IN, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, R.HQ],
    ],
    isPuzzle: false,
    boardArrows: [{ from: [5, 2], to: [3, 2] }],
  },
  "Infantry capture artillery": {
    board: [
      [B.HQ, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, B.AR, null, R.IN, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, R.HQ],
    ],
    isPuzzle: false,
    boardArrows: [{ from: [3, 5], to: [3, 4] }],
  },
  "Infantry capture defended artillery": {
    board: [
      [B.HQ, null, null, null, null, null, null, null],
      [null, null, null, R.IN, null, null, null, null],
      [null, null, null, null, B.IN, null, null, null],
      [null, null, null, B.AR, R.IN, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, R.HQ],
    ],
    isPuzzle: false,
    boardArrows: [{ from: [1, 3], to: [2, 3] }],
  },
  "Artillery capture infantry": {
    board: [
      [B.HQ, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, B.IN, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, R.AR, null, null, null],
      [null, null, null, null, null, null, null, R.HQ],
    ],
    isPuzzle: false,
    boardArrows: [{ from: [6, 4], to: [5, 4] }],
  },
  "Artillery capture artillery": {
    board: [
      [B.HQ, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, B.AR, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, R.HA, null, null, null],
      [null, null, null, null, null, null, null, R.HQ],
    ],
    isPuzzle: false,
    boardArrows: [{ from: [6, 4], to: [5, 4] }],
  },
  "Airborne capture artillery": {
    board: [
      [B.HQ, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, B.HA, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, R.AB, null, null, null, R.HQ],
    ],
    isPuzzle: false,
    boardArrows: [{ from: [7, 3], to: [2, 3] }],
  },
  "Airborne capture infantry": {
    board: [
      [B.HQ, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, B.IN, null, null, null],
      [null, null, null, null, R.IN, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, R.AB, null, null, null, R.HQ],
    ],
    isPuzzle: false,
    boardArrows: [{ from: [7, 3], to: [2, 3] }],
  },
  "Infantry capture HQ": {
    board: [
      [B.HQ, null, R.IN, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, R.IN, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, R.HQ],
    ],
    isPuzzle: false,
    boardArrows: [
      { from: [2, 1], to: [1, 0] },
      { from: [0, 2], to: [0, 1] },
    ],
  },
  "Infantry capture defended HQ": {
    board: [
      [B.HQ, null, R.IN, R.IN, null, null, null, null],
      [null, B.IN, null, null, null, null, null, null],
      [null, R.IN, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, R.HQ],
    ],
    isPuzzle: false,
    boardArrows: [],
  },
  "Capture an artillery": {
    board: [
      [B.HQ, null, null, B.H1, null, B.AR, null, null],
      [B.IN, B.IN, null, null, null, B.IN, null, null],
      [null, null, B.IN, B.AR, null, B.IN, null, null],
      [null, null, B.AI, null, B.IN, null, R.IN, null],
      [null, null, R.IN, null, R.AI, R.IN, null, null],
      [null, null, null, R.AA, null, null, null, null],
      [null, null, null, null, null, R.IN, R.IN, R.IN],
      [null, null, null, null, null, null, null, R.HQ],
    ],
    isPuzzle: true,
    boardArrows: [],
  },
  "Capture two infantry": {
    board: [
      [B.HQ, null, null, null, B.IN, null, null, null],
      [null, null, null, B.IN, R.IN, null, null, null],
      [null, null, B.IN, R.IN, null, R.IN, null, null],
      [null, B.IN, R.IN, null, null, null, null, null],
      [B.IN, R.IN, null, null, null, null, null, null],
      [R.IN, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, R.HQ],
    ],
    isPuzzle: true,
    boardArrows: [],
  },
  "Capture HQ!": {
    board: [
      [B.HQ, null, B.IN, null, null, null, null, null],
      [B.IN, null, null, null, null, null, null, null],
      [R.IN, null, B.IN, null, null, null, null, null],
      [null, R.AI, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, R.AB, R.HQ],
    ],
    isPuzzle: true,
    boardArrows: [],
  },
  "Collapse the center line": {
    board: [
      [B.HQ, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, B.IN, null, null, null, null, null, null],
      [null, null, B.AI, B.AI, B.AI, null, null, null],
      [null, null, R.IN, R.IN, R.IN, null, null, null],
      [null, null, null, null, null, R.AI, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, R.HQ],
    ],
    isPuzzle: true,
    boardArrows: [],
  },
  "Avoid being captured next turn": {
    board: [
      [B.HQ, null, null, null, null, null, null, null],
      [null, B.AI, B.A1, B.IN, B.IN, B.A2, null, null],
      [null, null, B.AI, null, null, B.IN, B.IN, null],
      [null, null, null, R.IN, R.AR, R.IN, null, null],
      [null, null, null, null, R.AI, null, null, null],
      [null, null, null, null, R.AI, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, R.HQ],
    ],
    isPuzzle: true,
    boardArrows: [],
  },
  "Take back the advantage": {
    board: [
      [B.HQ, null, null, null, null, null, null, null],
      [B.H1, null, null, null, null, null, null, null],
      [null, null, null, B.A2, B.AI, null, null, null],
      [null, null, B.IN, null, null, R.AI, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, R.IN, R.AI, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, R.HQ],
    ],
    isPuzzle: true,
    boardArrows: [],
  },
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
      lastPlayerMoves: [],
      redTurnStartBoard: boards[boardType].board,
      blueTurnStartBoard: boards[boardType].board,
      board: boards[boardType].board,
      thisTurnMoves: [],
      eval: 0,
      redReserve: {
        INFANTRY: 0,
        ARMORED_INFANTRY: 0,
        AIRBORNE_INFANTRY: 0,
        ARTILLERY: 0,
        ARMORED_ARTILLERY: 0,
        HEAVY_ARTILLERY: 0,
      },
      blueReserve: {
        INFANTRY: 0,
        ARMORED_INFANTRY: 0,
        AIRBORNE_INFANTRY: 0,
        ARTILLERY: 0,
        ARMORED_ARTILLERY: 0,
        HEAVY_ARTILLERY: 0,
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
