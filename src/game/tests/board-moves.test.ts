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
      "ria1 rib1 ric1 rid1 rie1 rif1 rfa1 rfb1 rfc1 rfd1 rfe1 rff1 rpa1 rpb1 rpc1 rpd1 rpe1 rpf1 rra1 rrb1 rrc1 rrd1 rre1 rrf1 rta1 rtb1 rtc1 rtd1 rte1 rtf1 rha1 rhb1 rhc1 rhd1 rhe1 rhf1 f2e3 f2f3 f2g3 f2e2 f2e1 f2f1 g2f3 g2g3 g2h3 g2f1 h2g3 h2h3 g1f1↑ g1f1↗ g1f1→ g1f1↘ g1f1↓ g1f1↙ g1f1← g1f1↖ g1g1↗ g1g1→ g1g1↘ g1g1↓ g1g1↙ g1g1← g1g1↖",
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
