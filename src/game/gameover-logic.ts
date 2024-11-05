import { GameoverState, GHQState, Player } from "./engine";

export function getGameoverState(G: GHQState): GameoverState | undefined {
  if (G.redElapsed > G.timeControl) {
    return newWinner("BLUE");
  }
  if (G.blueElapsed > G.timeControl) {
    return newWinner("RED");
  }

  if (!isHqOnBoard(G.board, "RED")) {
    return newWinner("BLUE");
  }
  if (!isHqOnBoard(G.board, "BLUE")) {
    return newWinner("RED");
  }

  return undefined;
}

function newWinner(player: Player): GameoverState {
  return {
    status: "WIN",
    winner: player,
  };
}

function isHqOnBoard(board: GHQState["board"], player: Player): boolean {
  return board.some((rows) =>
    rows.some((square) => square?.type === "HQ" && square.player === player)
  );
}
