import React from "react";
import { Coordinate } from "./engine";

export interface BoardArrowType {
  from: Coordinate;
  to: Coordinate;
}

interface BoardArrowProps {
  squareSize: number;
  from: Coordinate;
  to: Coordinate;
  className: string;
}

const BoardArrow: React.FC<BoardArrowProps> = ({
  squareSize,
  from,
  to,
  className,
}) => {
  const strokeWidth = squareSize / 5;
  const startX = from[1] * squareSize + squareSize / 2;
  const startY = from[0] * squareSize + squareSize / 2;
  const endX = to[1] * squareSize + squareSize / 2;
  const endY = to[0] * squareSize + squareSize / 2;

  const arrowHeadSize = squareSize / 5;
  const angle = Math.atan2(endY - startY, endX - startX);
  const arrowHeadX = endX - arrowHeadSize * Math.cos(angle);
  const arrowHeadY = endY - arrowHeadSize * Math.sin(angle);

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        opacity: 0.7,
      }}
      className={className}
    >
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <polygon
        points={`${endX},${endY} ${
          arrowHeadX + arrowHeadSize * Math.sin(angle)
        },${arrowHeadY - arrowHeadSize * Math.cos(angle)} ${
          arrowHeadX - arrowHeadSize * Math.sin(angle)
        },${arrowHeadY + arrowHeadSize * Math.cos(angle)}`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default BoardArrow;
