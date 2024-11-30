import React, { useState, useCallback } from "react";
import classNames from "classnames";
import { Coordinate } from "@/game/engine";

interface MouseTrackerProps {
  children: React.ReactNode;
  onRightClickDrag: (start: Coordinate, end: Coordinate) => void;
  onLeftClickDown: (coordinate: Coordinate) => void;
  onLeftClickUp: (coordinate: Coordinate) => void;
  onMouseOver: (coordinate: Coordinate) => void;
  ref: (instance: Element | null) => void;
  flipped: boolean;
}

export default function BoardContainer({
  children,
  onRightClickDrag,
  onLeftClickDown,
  onLeftClickUp,
  onMouseOver,
  ref,
  flipped,
}: MouseTrackerProps) {
  const [startCoords, setStartCoords] = useState<Coordinate | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        const { rowIndex, colIndex } = (e.target as HTMLElement).dataset;
        if (!rowIndex || !colIndex) return;
        const row = parseInt(rowIndex, 10);
        const col = parseInt(colIndex, 10);
        onLeftClickDown([row, col]);
      }
      if (e.button === 2) {
        const { rowIndex, colIndex } = (e.target as HTMLElement).dataset;
        if (!rowIndex || !colIndex) return;
        const row = parseInt(rowIndex, 10);
        const col = parseInt(colIndex, 10);
        setStartCoords([row, col]);
      }
    },
    [onLeftClickDown]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        const { rowIndex, colIndex } = (e.target as HTMLElement).dataset;
        if (!rowIndex || !colIndex) return;
        const row = parseInt(rowIndex, 10);
        const col = parseInt(colIndex, 10);
        onLeftClickUp([row, col]);
      }
      if (e.button === 2 && startCoords) {
        const { rowIndex, colIndex } = (e.target as HTMLElement).dataset;
        if (!rowIndex || !colIndex) return;
        const row = parseInt(rowIndex, 10);
        const col = parseInt(colIndex, 10);
        onRightClickDrag(startCoords, [row, col]);
        setStartCoords(null);
      }
    },
    [startCoords, onRightClickDrag, onLeftClickUp]
  );

  const handleMouseOver = useCallback(
    (e: React.MouseEvent) => {
      const { rowIndex, colIndex } = (e.target as HTMLElement).dataset;
      if (!rowIndex || !colIndex) return;
      const row = parseInt(rowIndex, 10);
      const col = parseInt(colIndex, 10);
      onMouseOver([row, col]);
    },
    [onMouseOver]
  );

  return (
    <div
      onMouseOver={handleMouseOver}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      className={classNames(
        "w-[360px] h-[360px] lg:w-[600px] lg:h-[600px] cursor-pointer relative",
        {
          "rotate-180": flipped,
        }
      )}
      ref={ref}
    >
      {children}
    </div>
  );
}
