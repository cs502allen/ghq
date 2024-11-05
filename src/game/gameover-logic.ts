import { GameoverState, GHQState, Player } from "./engine";

export function getGameoverState(G: GHQState): GameoverState | undefined {
  if (G.redElapsed > G.timeControl) {
    return newWinner("BLUE", "on time");
  }
  if (G.blueElapsed > G.timeControl) {
    return newWinner("RED", "on time");
  }

  if (!isHqOnBoard(G.board, "RED")) {
    return newWinner("BLUE", "by HQ capture");
  }
  if (!isHqOnBoard(G.board, "BLUE")) {
    return newWinner("RED", "by HQ capture");
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

function isHqOnBoard(board: GHQState["board"], player: Player): boolean {
  return board.some((rows) =>
    rows.some((square) => square?.type === "HQ" && square.player === player)
  );
}
