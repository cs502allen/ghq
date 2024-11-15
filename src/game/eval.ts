import { getAllowedMoves, isPieceArtillery } from "./board-moves";
import { freeInfantryCaptures } from "./capture-logic";
import {
  AllowedMove,
  GHQState,
  NonNullSquare,
  Player,
  ReserveFleet,
} from "./engine";
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

export interface EvalBoardState {
  board: GHQState["board"];
  redReserve: ReserveFleet;
  blueReserve: ReserveFleet;
  currentPlayerTurn: Player;
  thisTurnMoves: AllowedMove[];
}

export function calculateEval({
  board,
  redReserve,
  blueReserve,
  currentPlayerTurn,
  thisTurnMoves,
}: EvalBoardState): number {
  const scores: Record<Player, number> = {
    RED: 0,
    BLUE: 0,
  };

  const allowedMoves = getAllowedMoves({
    board,
    redReserve,
    blueReserve,
    currentPlayerTurn,
    thisTurnMoves,
  });

  // Find a list of candidate captures
  for (const move of allowedMoves) {
    if (move.name === "Move" && move.args.length === 3) {
      const [from, , capture] = move.args;
      if (!capture) {
        continue;
      }
      const fromPiece = board[from[0]][from[1]];
      if (fromPiece === null) {
        continue;
      }
      const capturePiece = board[capture[0]][capture[1]];
      if (capturePiece === null) {
        continue;
      }
      const captureScore = unitScores[capturePiece.type] ?? 0;
      if (capturePiece.player === "RED") {
        scores.RED -= captureScore;
      } else {
        scores.BLUE -= captureScore;
      }
    }
  }

  const freeCaptured = freeInfantryCaptures(board, currentPlayerTurn);
  for (const capture of freeCaptured) {
    if (capture.capture) {
      const captured = capture.capture;
      const attackerScore = unitScores[captured.piece.type] ?? 0;
      if (captured.piece.player === "RED") {
        scores.RED -= attackerScore;
      } else {
        scores.BLUE -= attackerScore;
      }
    }
  }

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
        scores.RED += 0.25;
      }
      if (bombarded[`${i},${j}`]?.BLUE && square.player === "RED") {
        scores.BLUE += 0.25;
      }

      // Add points if this piece has some good captures
    }
  }

  return Math.round(100 * (scores.RED - scores.BLUE)) / 100;
}
