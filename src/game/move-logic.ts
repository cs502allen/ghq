import { Coordinate, GHQState, Units } from "@/game/engine";

export function movesForActivePiece(
  coordinate: Coordinate,
  board: GHQState["board"]
): Coordinate[] {
  const piece = board[coordinate[0]] && board[coordinate[0]][coordinate[1]];

  if (piece) {
    const player = piece.player;
    const unitType = Units[piece.type];

    if (unitType.canParachute) {
      // on back
      // @todo right now this allows parachuting when on either back rank. Once we figure out how we want to pass color state around we'll change this
      if (coordinate[0] === 0 || coordinate[0] === 7) {
        const allowedParachutes: Coordinate[] = [];
        board.forEach((rank, x) => {
          rank.forEach((file, y) => {
            if (!file) {
              allowedParachutes.push([x, y]);
            }
          });
        });
        return allowedParachutes;
      } else {
        return getMoves(coordinate, unitType.mobility, board);
      }
    } else {
      return getMoves(coordinate, unitType.mobility, board);
    }
  } else {
    return [];
  }
}

function getMoves(
  coordinate: Coordinate,
  mobility: 1 | 2,
  board: GHQState["board"]
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

  for (const [dx, dy] of directions) {
    const newX = coordinate[0] + dx;
    const newY = coordinate[1] + dy;

    // must be on board
    if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
      const piece = board[newX][newY];
      // must not be occupied by a piece
      // @todo must not be under bombardment
      if (!piece) {
        allowedMoves.push([newX, newY]);

        // if mobility is 2 we can keep going this direction
        if (mobility === 2) {
          const newX2 = dx + newX;
          const newY2 = dy + newY;

          if (newX2 >= 0 && newX2 < 8 && newY2 >= 0 && newY2 < 8) {
            const piece2 = board[newX2][newY2];
            // must not be occupied by a piece
            // @todo must not be under bombardment
            if (!piece2) {
              allowedMoves.push([newX2, newY2]);
            }
          }
        }
      }
    }
  }

  return allowedMoves;
}
