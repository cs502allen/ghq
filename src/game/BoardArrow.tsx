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
  const angle = Math.atan2(to[0] - from[0], to[1] - from[1]);
  const isDiagonal = from[0] !== to[0] && from[1] !== to[1];
  const offset = isDiagonal ? squareSize * 0.4 : squareSize * 0.2;

  const startX =
    from[1] * squareSize + squareSize / 2 + Math.cos(angle) * offset;
  const startY =
    from[0] * squareSize + squareSize / 2 + Math.sin(angle) * offset;
  const endX = to[1] * squareSize + squareSize / 2 - Math.cos(angle) * offset;
  const endY = to[0] * squareSize + squareSize / 2 - Math.sin(angle) * offset;

  const arrowHeadSize = squareSize / 20;
  const arrowHeadWidth = arrowHeadSize * 0.7;
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
        opacity: 0.4,
      }}
      className={className}
    >
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        strokeWidth={strokeWidth}
      />
      <polygon
        points={`${endX},${endY} ${
          arrowHeadX + arrowHeadWidth * Math.sin(angle)
        },${arrowHeadY - arrowHeadWidth * Math.cos(angle)} ${
          arrowHeadX - arrowHeadWidth * Math.sin(angle)
        },${arrowHeadY + arrowHeadWidth * Math.cos(angle)}`}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

export default BoardArrow;
