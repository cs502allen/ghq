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

  function coordinateFromHTMLElement(el: HTMLElement): Coordinate | null {
    const { rowIndex, colIndex } = el.dataset;
    if (!rowIndex || !colIndex) return null;
    return [parseInt(rowIndex, 10), parseInt(colIndex, 10)];
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        const coordinate = coordinateFromHTMLElement(e.target as HTMLElement);
        if (!coordinate) return;
        onLeftClickDown(coordinate);
      }
      if (e.button === 2) {
        const coordinate = coordinateFromHTMLElement(e.target as HTMLElement);
        if (!coordinate) return;
        const [row, col] = coordinate;
        setStartCoords([row, col]);
      }
    },
    [onLeftClickDown]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        const coordinate = coordinateFromHTMLElement(e.target as HTMLElement);
        if (!coordinate) return;
        const [row, col] = coordinate;
        onLeftClickUp([row, col]);
      }
      if (e.button === 2 && startCoords) {
        const coordinate = coordinateFromHTMLElement(e.target as HTMLElement);
        if (!coordinate) return;
        const [row, col] = coordinate;
        onRightClickDrag(startCoords, [row, col]);
        setStartCoords(null);
      }
    },
    [startCoords, onRightClickDrag, onLeftClickUp]
  );

  const handleMouseOver = useCallback(
    (e: React.MouseEvent) => {
      const coordinate = coordinateFromHTMLElement(e.target as HTMLElement);
      if (!coordinate) return;
      const [row, col] = coordinate;
      onMouseOver([row, col]);
    },
    [onMouseOver]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const coordinate = coordinateFromHTMLElement(touch.target as HTMLElement);
      if (!coordinate) return;
      onLeftClickDown(coordinate);
    },
    [onLeftClickDown]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      const touchedElement = document.elementFromPoint(
        touch.pageX,
        touch.pageY
      );
      if (!touchedElement) return;
      const coordinate = coordinateFromHTMLElement(
        touchedElement as HTMLElement
      );
      if (!coordinate) return;
      onLeftClickUp(coordinate);
    },
    [onLeftClickUp]
  );

  return (
    <div
      onMouseOver={handleMouseOver}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={classNames(
        "w-[360px] h-[360px] lg:w-[600px] lg:h-[600px] cursor-pointer relative",
        {
          "rotate-180": flipped,
        }
      )}
      ref={ref}
      style={{ touchAction: "none" }}
    >
      {children}
    </div>
  );
}
