import { isPieceArtillery } from "./board-moves";
import { GHQState, Player } from "./engine";
import { bombardedSquares } from "./move-logic";

const unitScores: Record<string, number> = {
  INFANTRY: 1,
  ARMORED_INFANTRY: 2,
  AIRBORNE_INFANTRY: 5,
  ARTILLERY: 3,
  ARMORED_ARTILLERY: 5,
  HEAVY_ARTILLERY: 6,
  HQ: 100,
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

  // TODO(tyler): give points for getting to a position where you can take a piece for free

  const bombarded = bombardedSquares(board);

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const square = board[i][j];
      if (square === null) {
        continue;
      }

      // Add positional score
      if (square.type === "AIRBORNE_INFANTRY") {
        const homeRow = square.player === "RED" ? 7 : 0;
        const distance = Math.abs(i - homeRow);
        scores[square.player] += unitScores.AIRBORNE_INFANTRY - 0.7 * distance;
      } else if (isPieceArtillery(square)) {
        scores[square.player] +=
          (unitScores[square.type] ?? 0) + gradient[i][j];
      } else {
        scores[square.player] +=
          (unitScores[square.type] ?? 0) + gradient[i][j];
      }

      // If a player bombards a square with an enemy piece in it, give them points
      if (bombarded[`${i},${j}`]?.RED && square.player === "BLUE") {
        scores.RED += 0.5;
      }
      if (bombarded[`${i},${j}`]?.BLUE && square.player === "RED") {
        scores.BLUE += 0.5;
      }
    }
  }

  return Math.round(100 * (scores.RED - scores.BLUE)) / 100;
}
