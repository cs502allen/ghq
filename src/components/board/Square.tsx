/* eslint-disable @next/next/no-img-element */
"use client";

import React, { Ref, useEffect, useRef, useState } from "react";
import {
  Coordinate,
  GHQState,
  NonNullSquare,
  Orientation,
  type Square,
  Units,
} from "@/game/engine";
import classNames from "classnames";
import { Bombarded } from "@/game/move-logic";
import { Crosshair } from "lucide-react";
import { isBombardedBy, isPieceArtillery } from "../../game/board-moves";

import { areCoordsEqual } from "../../game/capture-logic";
import { UserActionState } from "./state";
import { playMoveSound } from "@/game/audio";

export interface SquareState {
  rowIndex: number;
  colIndex: number;
  square: Square;
  stagedSquare: Square;
  isRedBombarded: boolean;
  isBlueBombarded: boolean;
  isSelected: boolean;
  isCaptureCandidate: boolean;
  isBombardCandidate: boolean;
  showTarget: boolean;
  wasRecentlyCaptured: boolean;
  wasRecentlyMovedTo: boolean;
  isMovable: boolean;
  isRightClicked: boolean;
  isHovered: boolean;
  isMidMove: boolean;
  shouldAnimateFrom: Coordinate | undefined;
}
export function getSquareState({
  G,
  square,
  rowIndex,
  colIndex,
  bombarded,
  userActionState,
}: {
  G: GHQState;
  rowIndex: number;
  colIndex: number;
  square: Square;
  bombarded: Bombarded;
  userActionState: UserActionState | null;
}): SquareState {
  let isMovable = false;
  let isCaptureCandidate = false;

  // #perf-improvement-possible
  for (const move of userActionState?.candidateMoves ?? []) {
    if (
      move.name === "Move" &&
      areCoordsEqual([rowIndex, colIndex], move.args[1])
    ) {
      isMovable = true;
    } else if (
      move.name === "MoveAndOrient" &&
      areCoordsEqual([rowIndex, colIndex], move.args[1])
    ) {
      isMovable = true;
    } else if (
      move.name === "Reinforce" &&
      areCoordsEqual([rowIndex, colIndex], move.args[1])
    ) {
      isMovable = true;
    }

    if (
      move.name === "Move" &&
      areCoordsEqual([rowIndex, colIndex], move.args[2] ?? [-1, -1])
    ) {
      isCaptureCandidate = true;
    }
  }

  let isSelected = areCoordsEqual(
    [rowIndex, colIndex],
    userActionState?.selectedPiece?.coordinate ?? [-1, -1]
  );
  let isMidMove = false;
  let stagedSquare = null;
  let isBombardCandidate = false;

  // #perf-improvement-possible
  for (const move of userActionState?.chosenMoves ?? []) {
    if (
      (move.name === "Move" || move.name === "MoveAndOrient") &&
      areCoordsEqual([rowIndex, colIndex], move.args[0])
    ) {
      isMidMove = true;
      isSelected = false;
    }

    if (
      (move.name === "Move" || move.name === "MoveAndOrient") &&
      areCoordsEqual([rowIndex, colIndex], move.args[1])
    ) {
      isSelected = true;
      const [row, col] = move.args[0];
      stagedSquare = structuredClone(G.board[row][col]);

      if (
        stagedSquare &&
        move.name === "MoveAndOrient" &&
        userActionState?.hoveredCoordinate
      ) {
        stagedSquare.orientation = getOrientationBetween(
          [rowIndex, colIndex],
          userActionState.hoveredCoordinate
        );
      }
    }

    if (
      move.name === "MoveAndOrient" &&
      isBombardedBy(G.board, move.args[0], move.args[1], move.args[2], [
        rowIndex,
        colIndex,
      ])
    ) {
      isBombardCandidate = true;
    }
  }

  // Piece is actively hovered or is a move preference.
  const isHovered =
    areCoordsEqual(userActionState?.hoveredCoordinate ?? [-1, -1], [
      rowIndex,
      colIndex,
    ]) ||
    areCoordsEqual(userActionState?.movePreference ?? [-1, -1], [
      rowIndex,
      colIndex,
    ]);

  let shouldAnimateFrom: Coordinate | undefined = undefined;
  if (G.thisTurnMoves.length > 0) {
    const mostRecentMove = G.thisTurnMoves[G.thisTurnMoves.length - 1];
    if (
      (mostRecentMove.name === "Move" &&
        areCoordsEqual(mostRecentMove.args[1], [rowIndex, colIndex])) ||
      (mostRecentMove.name === "MoveAndOrient" &&
        areCoordsEqual(mostRecentMove.args[1], [rowIndex, colIndex]))
    ) {
      shouldAnimateFrom = mostRecentMove.args[0];
    }
  }

  return {
    rowIndex,
    colIndex,
    square,
    stagedSquare,
    isRedBombarded: bombarded[`${rowIndex},${colIndex}`]?.RED ?? false,
    isBlueBombarded: bombarded[`${rowIndex},${colIndex}`]?.BLUE ?? false,
    isSelected,
    showTarget: false,
    wasRecentlyCaptured: false,
    wasRecentlyMovedTo: false,
    isMovable,
    isCaptureCandidate,
    isBombardCandidate,
    isRightClicked: false,
    isHovered,
    isMidMove,
    shouldAnimateFrom,
  };
}

export default function Square({
  squareSize,
  pieceSize,
  squareState,
}: {
  squareSize: number;
  pieceSize: number;
  squareState: SquareState;
}) {
  const { rowIndex, colIndex, square, stagedSquare, shouldAnimateFrom } =
    squareState;
  const displaySquare = stagedSquare ?? square;
  const imageRef: Ref<HTMLImageElement> = useRef(null);
  const [animationState, setAnimationState] = useState<
    "started" | "ongoing" | "ended" | null
  >(null);

  function getTransform(square: NonNullSquare, isStartOfAnimation: boolean) {
    if (shouldAnimateFrom) {
      const [fromRow, fromCol] = shouldAnimateFrom;
      const [toRow, toCol] = [rowIndex, colIndex];
      const deltaX = (fromCol - toCol) * squareSize;
      const deltaY = (fromRow - toRow) * squareSize;

      if (isStartOfAnimation) {
        return `translate(${deltaX}px, ${deltaY}px)`;
      } else {
        return `translate(0px, 0px)`;
      }
    }

    return "";
  }

  useEffect(() => {
    if (animationState === "started" || animationState === "ongoing") {
      return;
    }

    if (imageRef.current && displaySquare) {
      imageRef.current.style.position = "absolute";
      imageRef.current.style.zIndex = "50";
      imageRef.current.style.transform = getTransform(displaySquare, true);
      setAnimationState("started");
    }
  }, [imageRef.current, displaySquare]);

  useEffect(() => {
    if (animationState !== "started") {
      return;
    }

    setAnimationState("ongoing");

    setTimeout(() => {
      if (imageRef.current && displaySquare) {
        imageRef.current.style.transition = "transform 0.2s ease-out";
        imageRef.current.style.transform = getTransform(displaySquare, false);
        imageRef.current.style.position = "relative";
        imageRef.current.style.zIndex = "1";
      }
    }, 50);

    setTimeout(() => {
      setAnimationState("ended");
    }, 250);
  }, [imageRef.current, squareState.shouldAnimateFrom, animationState]);

  return (
    <div
      style={{
        width: squareSize,
        height: squareSize,
      }}
      data-row-index={rowIndex}
      data-col-index={colIndex}
      key={`${rowIndex},${colIndex}`}
      className={classNames(
        "relative flex items-center justify-center select-none font-bold text-3xl"
      )}
    >
      <SquareBackground squareState={squareState} />
      {displaySquare && (
        <div ref={imageRef} className="pointer-events-none">
          <img
            className={classNames("pointer-events-none", {
              "opacity-25": squareState.isMidMove,
              "opacity-75": squareState.stagedSquare,
            })}
            src={`/${
              Units[displaySquare.type].imagePathPrefix
            }-${displaySquare.player.toLowerCase()}.png`}
            width={pieceSize}
            height={pieceSize}
            draggable="false"
            style={{
              transform: `rotate(${getRotationForPiece(displaySquare)}deg)`,
            }}
            alt={Units[displaySquare.type].imagePathPrefix}
          />
        </div>
      )}
    </div>
  );
}

function getRotationForPiece(square: NonNullSquare): number {
  if (isPieceArtillery(square)) {
    return square.orientation ?? 0;
  }

  return square.player === "BLUE" ? 180 : 0;
}

function SquareBackground({ squareState }: { squareState: SquareState }) {
  let baseBackground =
    (squareState.rowIndex + squareState.colIndex) % 2 === 0
      ? "bg-slate-400/70"
      : "bg-slate-200";

  if (squareState.isRedBombarded && squareState.isBlueBombarded) {
    baseBackground = "stripe-red-blue";
  } else if (squareState.isRedBombarded) {
    baseBackground = "stripe-red-transparent";
  } else if (squareState.isBlueBombarded) {
    baseBackground = "stripe-blue-transparent";
  }

  return (
    <>
      <SquareBackgroundColor className={baseBackground} />
      {squareState.isCaptureCandidate && (
        <>
          <SquareBackgroundColor
            className={classNames("z-10", {
              "bg-red-400/60": !squareState.isHovered,
              "bg-red-800/80": squareState.isHovered,
            })}
          />
          <Crosshair className="absolute z-10 text-red-200 w-1/2 h-1/2 pointer-events-none" />
        </>
      )}
      {squareState.isSelected && (
        <SquareBackgroundColor className="bg-green-800/50" />
      )}
      {squareState.isMovable &&
        (squareState.isHovered ? (
          <SquareBackgroundColor className="bg-green-800/50" />
        ) : (
          <div className="absolute rounded-full bg-green-700/50 w-1/3 h-1/3 pointer-events-none"></div>
        ))}
      {squareState.isBombardCandidate &&
        (squareState.isHovered ? (
          <SquareBackgroundColor className="bg-yellow-600/80" />
        ) : (
          <div
            className={
              "absolute rounded-full bg-yellow-400/80 w-1/3 h-1/3 pointer-events-none"
            }
          ></div>
        ))}
    </>
  );
}

function SquareBackgroundColor({ className }: { className: string }) {
  return (
    <div
      className={classNames(
        "absolute w-full h-full top-0 left-0 pointer-events-none",
        className
      )}
    ></div>
  );
}

function shouldFlipSquare(square: NonNullSquare): boolean {
  if (!isPieceArtillery(square)) {
    return square.player === "BLUE";
  }

  return false;
}

function getOrientationBetween(from: Coordinate, to: Coordinate): Orientation {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  if (fromRow === toRow) {
    return toCol > fromCol ? 90 : 270;
  } else if (fromCol === toCol) {
    return toRow > fromRow ? 180 : 0;
  } else if (toRow > fromRow && toCol > fromCol) {
    return 135;
  } else if (toRow > fromRow && toCol < fromCol) {
    return 225;
  } else if (toRow < fromRow && toCol > fromCol) {
    return 45;
  } else {
    return 315;
  }
}
