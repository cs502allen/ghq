"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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

  const [mostRecentMove, setMostRecentMove] = useState<
    AllowedMove | undefined
  >();
  const [board, setBoard] = useState<GHQState["board"]>(G.board);

  useEffect(() => {
    if (currentPlayerTurn === currentPlayer && G.thisTurnMoves.length > 0) {
      setMostRecentMove(G.thisTurnMoves[G.thisTurnMoves.length - 1]);
      setTimeout(() => setBoard(G.board), 250);
    }
  }, [G.thisTurnMoves]);

  useEffect(() => {
    setBoard(G.board);
  }, [currentPlayerTurn, ctx.gameover]);

  const bombarded = useMemo(() => bombardedSquares(board), [board]);
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
