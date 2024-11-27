"use client";

import React, { useCallback, useMemo } from "react";
import { AllowedMove, Coordinate, GHQState, Player } from "@/game/engine";
import { BoardProps } from "boardgame.io/react";
import { bombardedSquares } from "@/game/move-logic";
import { useMeasure } from "@uidotdev/usehooks";
import { pieceSizes, squareSizes } from "@/game/constants";
import { updateClick, updateHover, UserActionState } from "./state";
import Square, { getSquareState } from "./Square";
import BoardArrow from "@/game/BoardArrow";
import classNames from "classnames";
import useControls from "./Controls";
import BoardContainer from "./BoardContainer";
import useBoard from "./useBoard";
import useRightClick from "./useRightClick";

export default function Board({
  ctx,
  G,
  moves,
  plugins,
  undo,
  redo,
  userActionState,
  setUserActionState,
  possibleAllowedMoves,
  currentPlayer,
  currentPlayerTurn,
}: BoardProps<GHQState> & {
  currentPlayer: Player;
  currentPlayerTurn: Player;
  userActionState: UserActionState;
  setUserActionState: React.Dispatch<React.SetStateAction<UserActionState>>;
  possibleAllowedMoves: AllowedMove[];
}) {
  const { measureRef, squareSize, pieceSize } = useBoardDimensions();

  const { board, mostRecentMove, replay } = useBoard({
    ctx,
    G,
    moves,
    plugins,
    userActionState,
    currentPlayer,
    currentPlayerTurn,
  });

  useControls({ undo, redo, cancel: () => setUserActionState({}), replay });

  const bombarded = useMemo(() => bombardedSquares(board), [board]);
  const recentMoves = useMemo(
    () => [...G.lastTurnMoves["0"], ...G.lastTurnMoves["1"]],
    [ctx.turn]
  );
  const recentCaptures = useMemo(
    () => [...G.lastTurnCaptures["0"], ...G.lastTurnCaptures["1"]],
    [ctx.turn]
  );

  const { boardArrows, rightClicked, handleRightClickDrag, clearRightClick } =
    useRightClick({ board });

  const handleLeftClick = useCallback(
    ([rowIndex, colIndex]: Coordinate) => {
      if (ctx.gameover) {
        return;
      }

      const square = board[rowIndex][colIndex];
      setUserActionState((userActionState) =>
        updateClick(
          userActionState,
          board,
          square,
          [rowIndex, colIndex],
          possibleAllowedMoves,
          currentPlayer,
          currentPlayerTurn
        )
      );

      clearRightClick();
    },
    [board, possibleAllowedMoves, ctx.gameover]
  );

  const handleMouseOver = useCallback(([rowIndex, colIndex]: Coordinate) => {
    setUserActionState((userActionState) =>
      updateHover(userActionState, [rowIndex, colIndex])
    );
  }, []);

  const isFlipped = useMemo(() => currentPlayer === "BLUE", [currentPlayer]);

  return (
    <BoardContainer
      ref={measureRef}
      onRightClickDrag={handleRightClickDrag}
      onLeftClick={handleLeftClick}
      onMouseOver={handleMouseOver}
      flipped={isFlipped}
    >
      {board.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: "flex" }}>
          {row.map((square, colIndex) => (
            <div key={colIndex}>
              <Square
                squareSize={squareSize}
                pieceSize={pieceSize}
                squareState={getSquareState({
                  board,
                  mostRecentMove,
                  recentMoves,
                  recentCaptures,
                  rowIndex,
                  colIndex,
                  square,
                  bombarded,
                  userActionState,
                  rightClicked,
                })}
                isFlipped={isFlipped}
              />
            </div>
          ))}
        </div>
      ))}
      {boardArrows.map((boardArrow) => (
        <BoardArrow
          key={`${boardArrow.from[0]},${boardArrow.from[1]}-${boardArrow.to[0]},${boardArrow.to[1]}`}
          squareSize={squareSize}
          from={boardArrow.from}
          to={boardArrow.to}
          className={classNames("fill-green-600 stroke-green-600")}
        />
      ))}
    </BoardContainer>
  );
}

function useBoardDimensions() {
  const [measureRef, { width, height }] = useMeasure();

  const [squareSize, pieceSize] = useMemo(() => {
    const smallestDim: number = Math.min(width || 0, height || 0);
    if (smallestDim && smallestDim - squareSizes.large * 8 >= 0) {
      return [squareSizes.large, pieceSizes.large];
    } else {
      return [squareSizes.small, pieceSizes.small];
    }
  }, [width, height]);

  return { measureRef, squareSize, pieceSize };
}
