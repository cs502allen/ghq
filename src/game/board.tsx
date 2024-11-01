import React, { useEffect, useRef, useState } from "react";
import { GHQState, Square } from "@/game/engine";
import { BoardProps } from "boardgame.io/react";
const rows = 8;
const columns = 8;

export function GHQBoard({ ctx, G, moves }: BoardProps<GHQState>) {
  const divRef = useRef(null); // Create a ref
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (divRef.current) {
      // Use getBoundingClientRect to get the actual width
      const { width } = divRef.current.getBoundingClientRect();
      setWidth(width);
    }
  }, []); //

  return (
    <div className="grid bg-gray-200 absolute w-full h-full grid-cols-7">
      <div className="col-span-5 border-r-2 border-gray-100 flex items-center justify-center">
        <table ref={divRef} style={{ borderCollapse: "collapse" }}>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td
                    key={colIndex}
                    className="relative"
                    style={{
                      border: "1px solid black",
                      textAlign: "center",
                      width: "90px",
                      height: "90px",
                    }}
                  >
                    <div className="text-gray-400 absolute bottom-2 left-2 select-none">
                      {rowIndex},{colIndex}
                    </div>
                    {/*<BigSquare square={G.board[rowIndex][colIndex]} />*/}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="col-span-2 bg-white"></div>
    </div>
  );
}

function BigSquare(props: { square: Square }) {
  if (props.square) {
    return <div>{props.square.type}</div>;
  } else {
    return <div />;
  }
}
