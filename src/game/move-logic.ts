import { Coordinate, GHQState, Player, Units } from "@/game/engine";

export function movesForActivePiece(
  coordinate: Coordinate,
  board: GHQState["board"],
  allowedSquares: Record<string, boolean>,
  squaresWithAdjacentEnemyInfantry: Record<string, boolean>
): Coordinate[] {
  const piece = board[coordinate[0]] && board[coordinate[0]][coordinate[1]];

  if (!piece) {
    return [];
  }

  const player = piece.player;
  const unitType = Units[piece.type];
  const isOnBackRank =
    player === "RED" ? coordinate[0] === 7 : coordinate[0] === 0;

  if (unitType.canParachute && isOnBackRank) {
    const allowedParachutes: Coordinate[] = [];
    board.forEach((rank, x) => {
      rank.forEach((square, y) => {
        if (!square && allowedSquares[`${x},${y}`]) {
          allowedParachutes.push([x, y]);
        }
      });
    });
    return allowedParachutes;
  }

  return getMoves(
    coordinate,
    unitType.mobility,
    board,
    allowedSquares,
    squaresWithAdjacentEnemyInfantry
  );
}

function getMoves(
  coordinate: Coordinate,
  mobility: 1 | 2,
  board: GHQState["board"],
  allowedSquares: Record<string, boolean>,
  squaresWithAdjacentEnemyInfantry: Record<string, boolean>
) {
  const allowedMoves: Coordinate[] = [];

  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  // @todo right now this isn't written in such a way that would allow 3, 4 or arbitrary mobility.
  for (const [dx, dy] of directions) {
    const newX = coordinate[0] + dx;
    const newY = coordinate[1] + dy;

    // must be on board
    if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
      const piece = board[newX][newY];
      // must not have a piece and must be an allowed square (not bombarded or adjacent to enemy infantry)
      if (!piece && allowedSquares[`${newX},${newY}`]) {
        if (
          squaresWithAdjacentEnemyInfantry[
            `${coordinate[0]},${coordinate[1]}`
          ] &&
          squaresWithAdjacentEnemyInfantry[`${newX},${newY}`]
        ) {
          continue;
        }

        allowedMoves.push([newX, newY]);

        // if mobility is 2 we can keep going this direction
        if (mobility === 2) {
          const newX2 = dx + newX;
          const newY2 = dy + newY;

          if (newX2 >= 0 && newX2 < 8 && newY2 >= 0 && newY2 < 8) {
            const piece2 = board[newX2][newY2];
            // must not be occupied by a piece
            // must not be under bombardment
            if (!piece2 && allowedSquares[`${newX2},${newY2}`]) {
              allowedMoves.push([newX2, newY2]);
            }
          }
        }
      }
    }
  }

  return allowedMoves;
}

export function spawnPositionsForPlayer(
  board: GHQState["board"],
  player: Player,
  allowedSquares: Record<string, boolean>
): Coordinate[] {
  const rank = player === "RED" ? 7 : 0;

  const spawnable: Coordinate[] = [];

  board[rank].forEach((piece, index) => {
    if (!piece && allowedSquares[`${rank},${index}`]) {
      spawnable.push([rank, index]);
    }
  });

  return spawnable;
}

// keys will be 'x,y'
export type Bombarded = { [key: string]: { RED?: true; BLUE?: true } };

export function bombardedSquares(board: GHQState["board"]): Bombarded {
  const orientationVectors = {
    0: [-1, 0], // Up
    45: [-1, 1], // Top-Right
    90: [0, 1], // Right
    135: [1, 1], // Bottom-Right
    180: [1, 0], // Down
    225: [1, -1], // Bottom-Left
    270: [0, -1], // Left
    315: [-1, -1], // Top-Left
  };

  const bombarded: Bombarded = {};

  board.forEach((rows, x) => {
    rows.forEach((square, y) => {
      if (square && typeof Units[square.type].artilleryRange !== "undefined") {
        const range = Units[square.type].artilleryRange!;
        const orientation = square.orientation!;

        const orientationVector = orientationVectors[orientation];

        let currentX = x;
        let currentY = y;

        for (let i = 0; i < range; i++) {
          currentX += orientationVector[0];
          currentY += orientationVector[1];

          // off board, stop
          if (
            !(currentX >= 0 && currentX < 8 && currentY >= 0 && currentY < 8)
          ) {
            break;
          }

          const updateMe = bombarded[`${currentX},${currentY}`] || {};
          updateMe[square.player] = true;
          bombarded[`${currentX},${currentY}`] = updateMe;
        }
      }
    });
  });

  return bombarded;
}
