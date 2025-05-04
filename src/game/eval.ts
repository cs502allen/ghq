import { getAllowedMoves, isPieceArtillery } from "./board-moves";
import { freeInfantryCaptures, isInfantry } from "./capture-logic";
import { AllowedMove, Board, Player, ReserveFleet } from "./engine";
import { bombardedSquares } from "./move-logic";

const unitScores: Record<string, number> = {
  INFANTRY: 1,
  ARMORED_INFANTRY: 3,
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

const bombardGradient: number[][] = [
  [-0.1, -0.1, -0.1, -0.1, -0.1, -0.1, -0.1, -0.1],
  [-0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.1],
  [-0.05, 0.0, 0.05, 0.05, 0.05, 0.05, 0.0, -0.05],
  [-0.05, 0.0, 0.05, 0.1, 0.1, 0.05, 0.0, -0.05],
  [-0.05, 0.0, 0.05, 0.1, 0.1, 0.05, 0.0, -0.05],
  [-0.05, 0.0, 0.05, 0.05, 0.05, 0.05, 0.0, -0.05],
  [-0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.1],
  [-0.1, -0.1, -0.1, -0.1, -0.1, -0.1, -0.1, -0.1],
];

export interface EvalBoardState {
  board: Board;
  redReserve: ReserveFleet;
  blueReserve: ReserveFleet;
  currentPlayerTurn: Player;
  thisTurnMoves: AllowedMove[];
  isReplayMode?: boolean;
  enforceZoneOfControl?: boolean;
}

function updateScoresForCaptures({
  board,
  redReserve,
  blueReserve,
  currentPlayerTurn,
  thisTurnMoves,
  scores,
  calculateOpponent,
  enforceZoneOfControl = false,
}: EvalBoardState & {
  scores: Record<Player, number>;
  calculateOpponent: boolean;
}) {
  const player = calculateOpponent
    ? getOpponent(currentPlayerTurn)
    : currentPlayerTurn;

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const piece = board[i][j];
      if (!piece || piece.player !== player || !isPieceArtillery(piece)) {
        continue;
      }

      const adjacentSquares = [
        [i - 1, j],
        [i + 1, j],
        [i, j - 1],
        [i, j + 1],
      ];

      for (const [x, y] of adjacentSquares) {
        if (x < 0 || x >= board.length || y < 0 || y >= board[x].length) {
          continue;
        }

        const adjacentPiece = board[x][y];
        if (
          adjacentPiece &&
          adjacentPiece.player !== player &&
          isInfantry(adjacentPiece)
        ) {
          scores[player] -= unitScores[piece.type] * 0.5;
          break;
        }
      }
    }
  }

  return scores;
}

export function calculateEval({
  board,
  redReserve,
  blueReserve,
  currentPlayerTurn,
  thisTurnMoves,
  isReplayMode,
  enforceZoneOfControl = false,
}: EvalBoardState): number {
  if (isReplayMode) {
    return 0;
  }

  const scores: Record<Player, number> = {
    RED: 0,
    BLUE: 0,
  };

  updateScoresForCaptures({
    board,
    redReserve,
    blueReserve,
    currentPlayerTurn,
    thisTurnMoves,
    scores,
    calculateOpponent: false,
    enforceZoneOfControl,
  });

  updateScoresForCaptures({
    board,
    redReserve,
    blueReserve,
    currentPlayerTurn,
    thisTurnMoves,
    scores,
    calculateOpponent: true,
    enforceZoneOfControl,
  });

  const freeCaptured = freeInfantryCaptures(
    board,
    getOpponent(currentPlayerTurn)
  );
  for (const capture of freeCaptured) {
    const captured = capture.capture;
    const captureScore = unitScores[captured.piece.type];
    if (!captureScore) {
      console.warn("No score for piece", captured.piece);
      continue;
    }

    scores[captured.piece.player] -= captureScore;
  }

  const bombarded = bombardedSquares(board);

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const square = board[i][j];

      // If a player bombards a square, give them points for it
      if (bombarded[`${i},${j}`]?.RED) {
        scores.RED += bombardGradient[i][j];
      }
      if (bombarded[`${i},${j}`]?.BLUE) {
        scores.BLUE += bombardGradient[i][j];
      }

      if (square === null) {
        continue;
      }

      let thisSquareValue = 0;

      // Add positional score
      if (square.type === "AIRBORNE_INFANTRY") {
        const homeRow = square.player === "RED" ? 7 : 0;
        const distance = Math.abs(i - homeRow);
        thisSquareValue += unitScores.AIRBORNE_INFANTRY - 0.7 * distance;
      } else if (isPieceArtillery(square)) {
        thisSquareValue = (unitScores[square.type] ?? 0) + gradient[i][j];
      } else {
        thisSquareValue = (unitScores[square.type] ?? 0) + gradient[i][j];
      }

      scores[square.player] += thisSquareValue;

      // If a player bombards a square with an enemy piece in it, reduce the enemy's score
      if (bombarded[`${i},${j}`]?.RED && square.player === "BLUE") {
        scores.BLUE += thisSquareValue * 0.5;
      }
      if (bombarded[`${i},${j}`]?.BLUE && square.player === "RED") {
        scores.RED += thisSquareValue * 0.5;
      }

      // Add points if this piece has some good captures
    }
  }

  return Math.round(100 * (scores.RED - scores.BLUE)) / 100;
}

function getOpponent(player: Player): Player {
  return player === "RED" ? "BLUE" : "RED";
}
