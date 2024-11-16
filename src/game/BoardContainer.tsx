import React, { useState, useCallback } from "react";
import { Coordinate } from "./engine";

interface MouseTrackerProps {
  children: React.ReactNode;
  className?: string;
  onRightClickDrag: (start: Coordinate, end: Coordinate) => void;
}

export default function BoardContainer({
  children,
  className,
  onRightClickDrag,
}: MouseTrackerProps) {
  const [startCoords, setStartCoords] = useState<Coordinate | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 2) {
      const { rowIndex, colIndex } = (e.target as HTMLElement).dataset;
      if (!rowIndex || !colIndex) return;
      const row = parseInt(rowIndex, 10);
      const col = parseInt(colIndex, 10);
      setStartCoords([row, col]);
    }
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 2 && startCoords) {
        const { rowIndex, colIndex } = (e.target as HTMLElement).dataset;
        if (!rowIndex || !colIndex) return;
        const row = parseInt(rowIndex, 10);
        const col = parseInt(colIndex, 10);
        onRightClickDrag(startCoords, [row, col]);
        setStartCoords(null);
      }
    },
    [startCoords, onRightClickDrag]
  );

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      className={className}
    >
      {children}
    </div>
  );
}
