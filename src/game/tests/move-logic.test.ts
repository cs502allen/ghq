import { describe, expect, it } from "@jest/globals";
import { GHQState } from "@/game/engine";
import { movesForActivePiece } from "@/game/move-logic";
import {
  Blue,
  initialBoardSetup,
  initialBoardSetupWithAnAirborneBack,
  initialBoardSetupWithAnAirborneNotBack,
  initialBoardSetupWithAnArmored,
  Red,
} from "@/game/tests/test-boards";

describe("computing allowed moves", () => {
  it("can compute allowed when surrounded on all but one side", () => {
    // opening. top of the board, artillery right of the HQ
    const moves = movesForActivePiece([0, 1], initialBoardSetup);
    expect(moves).toMatchInlineSnapshot(`
      [
        [
          0,
          2,
        ],
      ]
    `);
  });

  it("can compute allowed moves when forward squares open", () => {
    // opening. top of the board, middle infantry
    const moves = movesForActivePiece([1, 1], initialBoardSetup);
    expect(moves).toMatchInlineSnapshot(`
      [
        [
          0,
          2,
        ],
        [
          2,
          0,
        ],
        [
          2,
          1,
        ],
        [
          2,
          2,
        ],
      ]
    `);
  });

  it("can compute allowed moves for 2 mobility piece", () => {
    // opening. top of the board, middle infantry
    const moves = movesForActivePiece([0, 7], initialBoardSetupWithAnArmored);
    expect(moves).toMatchInlineSnapshot(`
      [
        [
          0,
          6,
        ],
        [
          0,
          5,
        ],
        [
          1,
          6,
        ],
        [
          2,
          5,
        ],
        [
          1,
          7,
        ],
        [
          2,
          7,
        ],
      ]
    `);
  });

  it("can compute allowed moves for airborne on back", () => {
    // opening. top of the board, middle infantry
    const moves = movesForActivePiece(
      [0, 7],
      initialBoardSetupWithAnAirborneBack
    );
    expect(moves).toMatchInlineSnapshot(`
      [
        [
          0,
          2,
        ],
        [
          0,
          3,
        ],
        [
          0,
          4,
        ],
        [
          0,
          5,
        ],
        [
          0,
          6,
        ],
        [
          1,
          3,
        ],
        [
          1,
          4,
        ],
        [
          1,
          5,
        ],
        [
          1,
          6,
        ],
        [
          1,
          7,
        ],
        [
          2,
          0,
        ],
        [
          2,
          1,
        ],
        [
          2,
          2,
        ],
        [
          2,
          3,
        ],
        [
          2,
          4,
        ],
        [
          2,
          5,
        ],
        [
          2,
          6,
        ],
        [
          2,
          7,
        ],
        [
          3,
          0,
        ],
        [
          3,
          1,
        ],
        [
          3,
          2,
        ],
        [
          3,
          3,
        ],
        [
          3,
          4,
        ],
        [
          3,
          5,
        ],
        [
          3,
          6,
        ],
        [
          3,
          7,
        ],
        [
          4,
          0,
        ],
        [
          4,
          1,
        ],
        [
          4,
          2,
        ],
        [
          4,
          3,
        ],
        [
          4,
          4,
        ],
        [
          4,
          5,
        ],
        [
          4,
          6,
        ],
        [
          4,
          7,
        ],
        [
          5,
          0,
        ],
        [
          5,
          1,
        ],
        [
          5,
          2,
        ],
        [
          5,
          3,
        ],
        [
          5,
          4,
        ],
        [
          5,
          5,
        ],
        [
          5,
          6,
        ],
        [
          5,
          7,
        ],
        [
          6,
          0,
        ],
        [
          6,
          1,
        ],
        [
          6,
          2,
        ],
        [
          6,
          3,
        ],
        [
          6,
          4,
        ],
        [
          7,
          0,
        ],
        [
          7,
          1,
        ],
        [
          7,
          2,
        ],
        [
          7,
          3,
        ],
        [
          7,
          4,
        ],
        [
          7,
          5,
        ],
      ]
    `);
  });

  it("no unit can move to a square under enemy bombardment", () => {
    // opening. top of the board, artillery right of the HQ
    const moves = movesForActivePiece(
      [5, 1],
      [
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, Blue.ARTILLERY(180), null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, Red.INFANTRY, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
      ]
    );

    // under bombardment
    expect(moves).not.toContainEqual([4, 1]);
  });
  it("units can move to a square under friendly bombardment", () => {
    // opening. top of the board, artillery right of the HQ
    const moves = movesForActivePiece(
      [5, 1],
      [
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, Blue.ARTILLERY(180), null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, Blue.INFANTRY, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
      ]
    );

    // under bombardment
    expect(moves).not.toContain([4, 1]);
  });

  it("can compute allowed moves for airborne on not on back", () => {
    // opening. top of the board, middle infantry
    const moves = movesForActivePiece(
      [1, 3],
      initialBoardSetupWithAnAirborneNotBack
    );
    expect(moves).toMatchInlineSnapshot(`
          [
            [
              0,
              2,
            ],
            [
              0,
              3,
            ],
            [
              0,
              4,
            ],
            [
              1,
              4,
            ],
            [
              2,
              2,
            ],
            [
              2,
              3,
            ],
            [
              2,
              4,
            ],
          ]
      `);
  });
});
