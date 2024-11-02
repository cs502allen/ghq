import { Coordinate, GHQState, Player, Units } from "@/game/engine";

export function captureCandidates(
  lastMovedInfantry: Coordinate,
  board: GHQState["board"]
): Coordinate[] {
  const piece = board[lastMovedInfantry[0]][lastMovedInfantry[1]];
  if (piece) {
    const color = piece.player;

    return []; // choices for pieces to capture
  }

  return [];
}
