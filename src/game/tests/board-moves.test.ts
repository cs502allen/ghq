import { describe, expect, it } from "@jest/globals";
import { getAllowedMoves } from "@/game/board-moves";
import { FENtoBoardState } from "../notation";
import { allowedMoveToUci } from "../notation-uci";

interface Test {
  description: string;
  boardFEN: string;
  expectedMovesUCI: string;
}

const TESTS: Test[] = [
  {
    description: "initial board state",
    boardFEN: "qr↓6/iii5/8/8/8/8/5III/6R↑Q IIIIIFFFPRRTH IIIIIFFFPRRTH",
    expectedMovesUCI:
      "rih8 rih7 rih6 rih5 rih4 rih3 rfh8 rfh7 rfh6 rfh5 rfh4 rfh3 rph8 rph7 rph6 rph5 rph4 rph3 rrh8 rrh7 rrh6 rrh5 rrh4 rrh3 rth8 rth7 rth6 rth5 rth4 rth3 rhh8 rhh7 rhh6 rhh5 rhh4 rhh3 g3f4 g3f3 g3f2 g3g4 g3h4 g3h3 g2f3 g2f2 g2f1 g2h3 g1f2 g1f1 h2h3↑ h2h3↗ h2h3→ h2h3↘ h2h3↓ h2h3↙ h2h3← h2h3↖ h2h2↗ h2h2→ h2h2↘ h2h2↓ h2h2↙ h2h2← h2h2↖",
  },
];

describe("board moves", () => {
  for (const test of TESTS) {
    it(test.description, () => {
      const board = FENtoBoardState(test.boardFEN);
      const moves = getAllowedMoves({
        board: board.board,
        redReserve: board.redReserve,
        blueReserve: board.blueReserve,
        currentPlayerTurn: board.currentPlayerTurn ?? "RED", // TODO(tyler): this should come from the FEN
        thisTurnMoves: [],
      });

      const expectedMoves = test.expectedMovesUCI.split(" ");
      const actualMoves = moves.map(allowedMoveToUci);

      expect(actualMoves.length).toEqual(expectedMoves.length);
      expect(actualMoves).toEqual(expect.arrayContaining(expectedMoves));
    });
  }
});
