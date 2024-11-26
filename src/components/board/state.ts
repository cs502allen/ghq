import {
  AllowedMove,
  Coordinate,
  GHQState,
  Player,
  ReserveFleet,
  type Square,
} from "@/game/engine";
import { isBombardedBy, PlayerPiece } from "../../game/board-moves";

import { areCoordsEqual } from "../../game/capture-logic";

export interface UserActionState {
  selectedPiece?: PlayerPiece;
  selectedReserve?: keyof ReserveFleet;
  hoveredCoordinate?: Coordinate;
  movePreference?: Coordinate;
  candidateMoves?: AllowedMove[];
  chosenMove?: AllowedMove;
  chosenMoves?: AllowedMove[];
}

export function updateClick(
  self: UserActionState,
  board: GHQState["board"],
  square: Square,
  [rowIndex, colIndex]: Coordinate,
  possibleAllowedMoves: AllowedMove[],
  currentPlayer: Player,
  currentPlayerTurn: Player
): UserActionState {
  // You can only play on your turn.
  if (currentPlayer !== currentPlayerTurn) {
    return self;
  }

  // If we have chosen candidates already, let's lock in the final move.
  const chosenMove = self.chosenMoves?.find(
    (move) =>
      (move.name === "Move" &&
        areCoordsEqual(move.args[2] ?? [-1, -1], [rowIndex, colIndex])) ||
      (move.name === "MoveAndOrient" &&
        isBombardedBy(board, move.args[0], move.args[1], move.args[2], [
          rowIndex,
          colIndex,
        ])) ||
      (move.name === "Reinforce" &&
        areCoordsEqual(move.args[1], [rowIndex, colIndex]))
  );
  if (self.selectedPiece && chosenMove) {
    return {
      chosenMove,
    };
  }

  const choseCandidateMoves =
    self.candidateMoves?.filter(
      (move) =>
        (move.name === "Move" &&
          areCoordsEqual(move.args[1], [rowIndex, colIndex])) ||
        (move.name === "MoveAndOrient" &&
          areCoordsEqual(move.args[1], [rowIndex, colIndex])) ||
        (move.name === "Reinforce" &&
          areCoordsEqual(move.args[1], [rowIndex, colIndex]))
    ) ?? [];

  // If a move was already chosen out of a possible set of one moves, then we should play that move.
  if (
    (self.selectedPiece || self.selectedReserve) &&
    choseCandidateMoves.length === 1
  ) {
    return {
      chosenMove: choseCandidateMoves[0],
    };
  }

  // If there are multiple moves, then we need to provide the user with a choice.
  if (self.selectedPiece && choseCandidateMoves.length > 1) {
    return {
      ...self,
      chosenMoves: choseCandidateMoves,
    };
  }

  // If the square contains a piece, and it's the current player's piece, then we should show the possible moves.
  if (square && square.player === currentPlayer) {
    const coordinate: Coordinate = [rowIndex, colIndex];
    const candidateMoves =
      possibleAllowedMoves.filter(
        (move) =>
          (move.name === "Move" && areCoordsEqual(coordinate, move.args[0])) ||
          (move.name === "MoveAndOrient" &&
            areCoordsEqual(coordinate, move.args[0]))
      ) ?? [];

    // If there are no candidate moves, then we should clear the state.
    if (candidateMoves.length === 0) {
      return {};
    }

    return {
      candidateMoves,
      selectedPiece: {
        piece: square,
        coordinate: [rowIndex, colIndex],
      },
    };
  }

  // Otherwise, we should clear the state.
  return {};
}

export function updateHover(
  self: UserActionState,
  [rowIndex, colIndex]: Coordinate
): UserActionState {
  return {
    ...self,
    hoveredCoordinate: [rowIndex, colIndex],
  };
}

export function updateReserveClick(
  self: UserActionState,
  kind: keyof ReserveFleet,
  possibleAllowedMoves: AllowedMove[]
): UserActionState {
  const candidateMoves =
    possibleAllowedMoves.filter(
      (move) => move.name === "Reinforce" && move.args[0] === kind
    ) ?? [];
  return {
    candidateMoves,
    selectedReserve: kind,
  };
}
