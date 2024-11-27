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

  const board = useMemo(() => {
    // If it's the opponent's turn, show the board as it was at the start of their turn.
    if (currentPlayerTurn !== currentPlayer) {
      if (currentPlayer === "RED") return G.redTurnStartBoard;
      if (currentPlayer === "BLUE") return G.blueTurnStartBoard;
    }

    // Otherwise, show the live board
    return G.board;
  }, [G.board, currentPlayerTurn, ctx.gameover]);

  const mostRecentMove = useMemo(
    () => G.thisTurnMoves[G.thisTurnMoves.length - 1],
    [G.thisTurnMoves]
  );
  const recentMoves = useMemo(
    () => [...G.lastTurnMoves["0"], ...G.lastTurnMoves["1"]],
    [ctx.turn]
  );
  const recentCaptures = useMemo(
    () => [...G.lastTurnCaptures["0"], ...G.lastTurnCaptures["1"]],
    [ctx.turn]
  );

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
      {board.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: "flex" }}>
          {row.map((square, colIndex) => (
            <Square
              key={colIndex}
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
              })}
            />
          ))}
        </div>
      ))}
    </BoardContainer>
  );
}
