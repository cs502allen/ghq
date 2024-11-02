import { describe, expect, it } from "@jest/globals";
import { bombardedSquares } from "@/game/move-logic";
import {
  artillaryFaceOff,
  initialBoardSetup,
} from "@/game/tests/test-boards";

describe("computing bombarded squares ", () => {
  it("can compute initial board position", () => {
    // opening. top of the board, artillery right of the HQ
    const bombarded = bombardedSquares(initialBoardSetup);
    expect(bombarded).toMatchInlineSnapshot(`
      {
        "1,1": {
          "BLUE": true,
        },
        "2,1": {
          "BLUE": true,
        },
        "5,6": {
          "RED": true,
        },
        "6,6": {
          "RED": true,
        },
      }
    `);
  });

  it("can compute overlapping bombardment ", () => {
    // opening. top of the board, artillery right of the HQ
    const bombarded = bombardedSquares(artillaryFaceOff);
    expect(bombarded).toMatchInlineSnapshot(`
      {
        "3,1": {
          "BLUE": true,
        },
        "3,2": {
          "BLUE": true,
          "RED": true,
        },
        "3,3": {
          "RED": true,
        },
      }
    `);
  });
});
