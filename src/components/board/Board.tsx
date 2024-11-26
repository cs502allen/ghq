"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { AllowedMove, Coordinate, GHQState, Player } from "@/game/engine";
import { BoardProps } from "boardgame.io/react";
import { bombardedSquares } from "@/game/move-logic";

import { useMeasure } from "@uidotdev/usehooks";
import { pieceSizes, squareSizes } from "@/game/constants";
import BoardContainer from "../../game/BoardContainer";
import { updateClick, updateHover, UserActionState } from "./state";
import Square, { getSquareState } from "./Square";

function playerIdToPlayer(playerId: string): Player {
  return playerId === "0" ? "RED" : "BLUE";
}

export default function Board({
  ctx,
  G,
  moves,
  playerID,
  undo,
  redo,
  plugins,
  log,
  userActionState,
  setUserActionState,
  possibleAllowedMoves,
}: BoardProps<GHQState> & {
  userActionState: UserActionState;
  setUserActionState: React.Dispatch<React.SetStateAction<UserActionState>>;
  possibleAllowedMoves: AllowedMove[];
}) {
  const currentPlayerTurn = useMemo(
    () => playerIdToPlayer(ctx.currentPlayer),
    [ctx.currentPlayer]
  );
  const currentPlayer = useMemo(
    () => (playerID === null ? currentPlayerTurn : playerIdToPlayer(playerID)),
    [currentPlayerTurn, playerID]
  );
  const bombarded = useMemo(() => bombardedSquares(G.board), [G.board]);
  const board = useMemo(() => G.board, [G.board]);

  const [measureRef, { width, height }] = useMeasure();

  const [squareSize, pieceSize] = useMemo(() => {
    const smallestDim: number = Math.min(width || 0, height || 0);
    if (smallestDim && smallestDim - squareSizes.large * 8 >= 0) {
      return [squareSizes.large, pieceSizes.large];
    } else {
      return [squareSizes.small, pieceSizes.small];
    }
  }, [width, height]);

  useEffect(() => {
    if (!userActionState.chosenMove) {
      return;
    }

    const { name, args } = userActionState.chosenMove;
    moves[name](...args);
  }, [userActionState.chosenMove]);

  const handleRightClickDrag = (
    from: [number, number],
    to: [number, number]
  ): void => {};

  const handleLeftClick = useCallback(
    ([rowIndex, colIndex]: Coordinate) => {
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
    },
    [board, possibleAllowedMoves]
  );

  const handleMouseOver = useCallback(([rowIndex, colIndex]: Coordinate) => {
    setUserActionState((userActionState) =>
      updateHover(userActionState, [rowIndex, colIndex])
    );
  }, []);

  return (
    <BoardContainer
      ref={measureRef}
      onRightClickDrag={handleRightClickDrag}
      onLeftClick={handleLeftClick}
      onMouseOver={handleMouseOver}
      flipped={currentPlayer === "BLUE"}
    >
      {G.board.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: "flex" }}>
          {row.map((square, colIndex) => (
            <Square
              key={colIndex}
              squareSize={squareSize}
              pieceSize={pieceSize}
              squareState={getSquareState({
                G,
                rowIndex,
                colIndex,
                square,
                bombarded,
                userActionState,
              })}
            />
          ))}
        </div>
      ))}
    </BoardContainer>
  );
}
