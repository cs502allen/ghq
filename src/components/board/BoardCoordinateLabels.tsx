import { colIndexToFile, rowIndexToRank } from "@/game/notation";
import classNames from "classnames";

export default function BoardCoordinateLabels({
  isFlipped,
  colIndex,
  rowIndex,
}: {
  isFlipped: boolean;
  colIndex: number;
  rowIndex: number;
}) {
  const color =
    (rowIndex + colIndex) % 2 === 0 ? "text-gray-50" : "text-gray-400";
  return (
    <>
      <div
        className={classNames(
          "absolute top-0 left-1 select-none text-xs font-bold",
          { "rotate-180": isFlipped },
          color
        )}
      >
        {colIndex === 0 && rowIndexToRank(rowIndex)}
      </div>
      <div
        className={classNames(
          "absolute bottom-0 left-1 select-none text-xs font-bold",
          { "rotate-180": isFlipped },
          color
        )}
      >
        {rowIndex === 7 && colIndexToFile(colIndex)}
      </div>
    </>
  );
}
