import { getAllowedMoves, isPieceArtillery } from "./board-moves";
import { freeInfantryCaptures } from "./capture-logic";
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
}

function updateScoresForCaptures({
  board,
  redReserve,
  blueReserve,
  currentPlayerTurn,
  thisTurnMoves,
  scores,
  calculateOpponent,
}: EvalBoardState & {
  scores: Record<Player, number>;
  calculateOpponent: boolean;
}) {
  const allowedMoves = getAllowedMoves({
    board,
    redReserve,
    blueReserve,
    currentPlayerTurn: calculateOpponent
      ? getOpponent(currentPlayerTurn)
      : currentPlayerTurn,
    thisTurnMoves,
  });
  for (const move of allowedMoves) {
    if (move.name === "Move" && move.args.length === 3) {
      const [from, , capture] = move.args;
      if (!capture) {
        continue;
      }
      const fromPiece = board[from[0]][from[1]];
      if (fromPiece === null) {
        console.warn("From piece is null", move);
        continue;
      }
      const capturePiece = board[capture[0]][capture[1]];
      if (capturePiece === null) {
        console.warn("Capture piece is null", move);
        continue;
      }
      const captureScore = unitScores[capturePiece.type];
      if (!captureScore) {
        console.warn("No score for piece", move);
        continue;
      }
      scores[fromPiece.player] += captureScore;
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
}: EvalBoardState): number {
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
  });

  updateScoresForCaptures({
    board,
    redReserve,
    blueReserve,
    currentPlayerTurn,
    thisTurnMoves,
    scores,
    calculateOpponent: true,
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

      // If a player bombards a square, give them points for it
      if (bombarded[`${i},${j}`]?.RED) {
        scores.RED += bombardGradient[i][j];
      }
      if (bombarded[`${i},${j}`]?.BLUE) {
        scores.BLUE += bombardGradient[i][j];
      }

      // If a player bombards a square with an enemy piece in it, reduce the enemy's score
      if (bombarded[`${i},${j}`]?.RED && square.player === "BLUE") {
        scores.BLUE -= thisSquareValue;
      }
      if (bombarded[`${i},${j}`]?.BLUE && square.player === "RED") {
        scores.RED -= thisSquareValue;
      }

      // Add points if this piece has some good captures
    }
  }

  return Math.round(100 * (scores.RED - scores.BLUE)) / 100;
}

function getOpponent(player: Player): Player {
  return player === "RED" ? "BLUE" : "RED";
}
