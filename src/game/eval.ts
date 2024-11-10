import { GHQState, Player } from "./engine";

const unitScores: Record<string, number> = {
  INFANTRY: 1,
  ARMORED_INFANTRY: 2,
  AIRBORNE_INFANTRY: 5,
  ARTILLERY: 3,
  ARMORED_ARTILLERY: 5,
  HEAVY_ARTILLERY: 6,
};

const gradient: number[][] = [
  [-0.25, -0.25, -0.25, -0.25, -0.25, -0.25, -0.25, -0.25],
  [-0.25, -0.15, -0.15, -0.15, -0.15, -0.15, -0.15, -0.25],
  [-0.25, -0.15, 0.0, 0.0, 0.0, 0.0, -0.15, -0.25],
  [-0.25, -0.15, 0.0, 0.25, 0.25, 0.0, -0.15, -0.25],
  [-0.25, -0.15, 0.0, 0.25, 0.25, 0.0, -0.15, -0.25],
  [-0.25, -0.15, 0.0, 0.0, 0.0, 0.0, -0.15, -0.25],
  [-0.25, -0.15, -0.15, -0.15, -0.15, -0.15, -0.15, -0.25],
  [-0.25, -0.25, -0.25, -0.25, -0.25, -0.25, -0.25, -0.25],
];

export function calculateEval(board: GHQState["board"]): number {
  const scores: Record<Player, number> = {
    RED: 0,
    BLUE: 0,
  };

  // TODO(tyler): give points for bombarding central squares

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const square = board[i][j];
      if (square === null) {
        continue;
      }

      scores[square.player] += (unitScores[square.type] ?? 0) + gradient[i][j];
    }
  }

  return Math.round(100 * (scores.RED - scores.BLUE)) / 100;
}
