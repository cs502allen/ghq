import { getAllowedMoves, getOpponent } from "./board-moves";
import { GameoverState, GHQState, Player } from "./engine";
import { GameV2 } from "./engine-v2";

export function getGameoverState(
  G: GHQState,
  currentPlayerTurn: Player,
  engine?: GameV2
): GameoverState | undefined {
  // No gameover during replays
  if (G.isReplayMode) {
    return;
  }

  if (G.timeControl > 0 && G.redElapsed > G.timeControl) {
    return newWinner("BLUE", "on time");
  }
  if (G.timeControl > 0 && G.blueElapsed > G.timeControl) {
    return newWinner("RED", "on time");
  }

  if (!isHqOnBoard(G.board, "RED")) {
    return newWinner("BLUE", "by HQ capture");
  }
  if (!isHqOnBoard(G.board, "BLUE")) {
    return newWinner("RED", "by HQ capture");
  }

  if (isPlayerOutOfMoves(G, getOpponent(currentPlayerTurn), engine)) {
    return { status: "DRAW", reason: "stalemate" };
  }

  if (engine && G.v2state) {
    const outcome = engine.getOutcome(G.v2state);
    if (outcome) {
      return {
        status: outcome.winner ? "WIN" : "DRAW",
        winner: outcome.winner,
        reason: outcome.termination,
      };
    }
  }

  return undefined;
}

function newWinner(player: Player, reason: string): GameoverState {
  return {
    status: "WIN",
    winner: player,
    reason,
  };
}

export function isHqOnBoard(board: GHQState["board"], player: Player): boolean {
  return board.some((rows) =>
    rows.some((square) => square?.type === "HQ" && square.player === player)
  );
}

function isPlayerOutOfMoves(
  G: GHQState,
  player: Player,
  engine?: GameV2
): boolean {
  const allowedMoves = getAllowedMoves({
    board: G.board,
    redReserve: G.redReserve,
    blueReserve: G.blueReserve,
    currentPlayerTurn: player,
    thisTurnMoves: G.thisTurnMoves,
    enforceZoneOfControl: G.enforceZoneOfControl,
    v2state: G.v2state,
    engine,
  });

  return allowedMoves.length === 0;
}

export function checkTimeForGameover({
  G,
  currentPlayer,
}: {
  G: GHQState;
  currentPlayer: Player;
}) {
  if (G.timeControl === 0) {
    return;
  }

  const elapsed = Date.now() - G.turnStartTime;

  const playerElapsed = currentPlayer === "RED" ? G.redElapsed : G.blueElapsed;
  const newPlayerElapsed = playerElapsed + elapsed - G.bonusTime;
  const timeLeft = G.timeControl - newPlayerElapsed;

  if (timeLeft >= 0) {
    return;
  }

  if (currentPlayer === "RED") {
    G.redElapsed = newPlayerElapsed;
  } else {
    G.blueElapsed = newPlayerElapsed;
  }

  const gameover: GameoverState = {
    status: "WIN",
    winner: currentPlayer === "RED" ? "BLUE" : "RED",
    reason: "on time",
  };

  return gameover;
}
