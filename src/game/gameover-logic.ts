import { GameoverState, GHQState, Player } from "./engine";

export function getGameoverState(
  board: GHQState["board"]
): GameoverState | undefined {
  if (!isHqOnBoard(board, "RED")) {
    return {
      status: "WIN",
      winner: "BLUE",
    };
  }
  if (!isHqOnBoard(board, "BLUE")) {
    return {
      status: "WIN",
      winner: "RED",
    };
  }

  return undefined;
}

function isHqOnBoard(board: GHQState["board"], player: Player): boolean {
  return board.some((rows) =>
    rows.some((square) => square?.type === "HQ" && square.player === player)
  );
}
