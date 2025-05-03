import { describe, expect, it } from "@jest/globals";
import {
  getPlayerPieces,
  movesForActivePiece,
  movesForActivePieceV2,
} from "@/game/move-logic";
import {
  Blue,
  initialBoardSetup,
  initialBoardSetupWithAnAirborneBack,
  initialBoardSetupWithAnAirborneEnemyBack,
  initialBoardSetupWithAnAirborneNotBack,
  initialBoardSetupWithAnArmored,
  Red,
} from "@/game/tests/test-boards";
import { Board, Coordinate, Square } from "../engine";

const _ = null; // empty square
const O = true; // square that can be moved to

// Red pieces (indicated by uppercase)
const I: Square = { type: "INFANTRY", player: "RED" };
const F: Square = { type: "ARMORED_INFANTRY", player: "RED" };

// Blue pieces (indicated by lowercase)
const i: Square = { type: "INFANTRY", player: "BLUE" };
const f: Square = { type: "ARMORED_INFANTRY", player: "BLUE" };
const r: Square = { type: "ARTILLERY", player: "BLUE", orientation: 180 };

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

  it("can compute allowed moves for airborne on enemy back", () => {
    // opening. top of the board, middle infantry
    const moves = movesForActivePiece(
      [7, 0],
      initialBoardSetupWithAnAirborneEnemyBack
    );
    expect(moves).toMatchInlineSnapshot(`
          [
            [
              6,
              0,
            ],
            [
              6,
              1,
            ],
            [
              7,
              1,
            ],
          ]
      `);
  });

  it("[GHQ-201] Moving a regular infantry from an engaged square, to an unengaged square.", () => {
    expectMoves(
      [
        [_, i, _, _, _, _, _, _],
        [i, I, O, _, _, _, _, _],
        [I, O, O, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
      ],
      [1, 1]
    );
  });

  it("[GHQ-202] Moving an armored infantry from an engaged square, through an unengaged square, to square where it can capture.", () => {
    expectMoves(
      [
        [_, O, _, O, i, _, _, _],
        [_, O, O, _, I, _, _, _],
        [i, F, O, O, _, _, _, _],
        [_, O, O, _, _, _, _, _],
        [_, O, _, O, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
      ],
      [2, 1]
    );
  });

  it("[GHQ-203] Moving a regular infantry from and engaged square to a square where it can capture an artillery.", () => {
    expectMoves(
      [
        [_, O, r, _, _, _, _, _],
        [i, I, _, _, _, _, _, _],
        [_, O, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
      ],
      [1, 1]
    );
  });

  it("[GHQ-205] Moving an armored infantry from an unengaged square, through a square where it could become engaged, to an unengaged square.", () => {
    expectMoves(
      [
        [f, _, O, _, O, _, _, _],
        [_, f, O, O, _, _, _, _],
        [I, O, F, O, O, _, _, _],
        [_, O, O, O, _, _, _, _],
        [O, _, O, _, O, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
      ],
      [2, 2]
    );
  });

  it("[GHQ-206] Moving an armored infantry from an unengaged square, through a square where it could become engaged, to an engaged square.", () => {
    expectMoves(
      [
        [O, i, O, _, O, _, _, _],
        [i, O, O, O, _, _, _, _],
        [I, O, F, O, O, _, _, _],
        [_, O, O, O, _, _, _, _],
        [O, _, O, _, O, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
      ],
      [2, 2]
    );
  });

  it("[GHQ-301] Moving a regular infantry from an engaged square to an engaged square.", () => {
    expectMoves(
      [
        [_, i, _, _, _, _, _, _],
        [i, I, O, _, _, _, _, _],
        [I, O, I, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
      ],
      [1, 1]
    );
  });

  it("[GHQ-302] Moving a regular infantry from an engaged square to a square where it can capture an infantry.", () => {
    expectMoves(
      [
        [_, _, i, I, _, _, _, _],
        [i, I, _, _, _, _, _, _],
        [_, O, O, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
      ],
      [1, 1]
    );
  });

  it("[GHQ-303] Moving an armored infantry from an engaged square, through an engaged square, to a square where it can capture.", () => {
    expectMoves(
      [
        [_, _, _, _, _, _, _, _],
        [i, _, r, _, _, _, _, _],
        [F, r, _, _, _, _, _, _],
        [O, _, _, _, _, _, _, _],
        [O, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
      ],
      [2, 0]
    );
  });

  it("[GHQ-304] Moving an armored infantry from an engaged square, through an engaged square, to square where it can capture.", () => {
    expectMoves(
      [
        [_, _, _, i, _, _, _, _],
        [i, _, _, I, _, _, _, _],
        [F, O, O, _, _, _, _, _],
        [O, O, _, _, _, _, _, _],
        [O, _, O, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
      ],
      [2, 0]
    );
  });
});

type SOM = Square | boolean | null;

type BoardAndExpectedMoves = [
  [SOM, SOM, SOM, SOM, SOM, SOM, SOM, SOM],
  [SOM, SOM, SOM, SOM, SOM, SOM, SOM, SOM],
  [SOM, SOM, SOM, SOM, SOM, SOM, SOM, SOM],
  [SOM, SOM, SOM, SOM, SOM, SOM, SOM, SOM],
  [SOM, SOM, SOM, SOM, SOM, SOM, SOM, SOM],
  [SOM, SOM, SOM, SOM, SOM, SOM, SOM, SOM],
  [SOM, SOM, SOM, SOM, SOM, SOM, SOM, SOM],
  [SOM, SOM, SOM, SOM, SOM, SOM, SOM, SOM]
];

function expectMoves(
  boardAndExpectedMoves: BoardAndExpectedMoves,
  piece: Coordinate
) {
  // Construct board from boardAndExpectedMoves (remove booleans)
  const board: Board = boardAndExpectedMoves.map((row) =>
    row.map((square) => {
      if (typeof square === "boolean") return null;
      return square as Square;
    })
  ) as Board;

  // Construct expected allowable moves from boardAndExpectedMoves (only keep booleans and null)
  const expectedAllowableMoves: (boolean | null)[][] =
    boardAndExpectedMoves.map((row) =>
      row.map((square) => (typeof square === "boolean" ? square : null))
    );

  const expectedMoves = expectedAllowableMoves
    .map((row, y) => row.map((allowable, x) => (allowable ? [y, x] : null)))
    .flat()
    .filter(Boolean);

  const { allowedSquares, squaresWithAdjacentEnemyInfantry } = getPlayerPieces(
    board,
    "RED",
    true
  );
  const moves = movesForActivePieceV2(
    piece,
    board,
    allowedSquares,
    squaresWithAdjacentEnemyInfantry
  );

  expect(moves.length).toBe(expectedMoves.length);
  expect(moves).toEqual(expect.arrayContaining(expectedMoves));
  expect(expectedMoves).toEqual(expect.arrayContaining(moves));
}
