import React, { PropsWithChildren, useCallback, useEffect } from "react";
import { Orientation, Player } from "@/game/engine";
import classNames from "classnames";
import { useState, useRef } from "react";

export function SelectOrientation(
  props: PropsWithChildren<{
    player: Player;
    squareSize: number;
    initialOrientation: Orientation;
    onChange: (orientation: Orientation) => void;
  }>
) {
  const color = props.player === "RED" ? "text-red-600" : "text-blue-600";

  const asBlue = props.player === "BLUE";

  const [angle, ref] = useMouseAngle();

  const [stagedOrientation, setStagedOrientation] = useState<Orientation>(
    props.initialOrientation
  );

  useEffect(() => {
    const orientations: Orientation[] = [
      180, 225, 270, 315, 0, 45, 90, 135, 180, 225, 270, 315,
    ];

    const getClosestOrientation = (angle: number): Orientation => {
      return orientations.reduce((prev, curr) => {
        const prevDiff = Math.min(
          Math.abs(prev - angle),
          Math.abs(prev - angle + 360),
          Math.abs(prev - angle - 360)
        );
        const currDiff = Math.min(
          Math.abs(curr - angle),
          Math.abs(curr - angle + 360),
          Math.abs(curr - angle - 360)
        );

        return currDiff < prevDiff ? curr : prev;
      }) as Orientation;
    };
    const orientation = getClosestOrientation((angle as number) - 45 / 2);

    // console.log(orientation);

    if (asBlue) {
      if (orientation === 0) setStagedOrientation(180);
      else if (orientation === 45) setStagedOrientation(225);
      else if (orientation === 90) setStagedOrientation(270);
      else if (orientation === 135) setStagedOrientation(315);
      else if (orientation === 180) setStagedOrientation(0);
      else if (orientation === 225) setStagedOrientation(45);
      else if (orientation === 270) setStagedOrientation(90);
      else if (orientation === 315) setStagedOrientation(135);
    } else {
      setStagedOrientation(orientation);
    }
  }, [angle, asBlue]);

  // console.log(stagedOrientation);

  useAnyClick(
    useCallback(() => {
      props.onChange(stagedOrientation);
    }, [stagedOrientation, props.onChange])
  );

  const angles: { [key: string]: Orientation } = {
    topLeft: asBlue ? 135 : 315,
    top: asBlue ? 180 : 0,
    topRight: asBlue ? 225 : 45,
    left: asBlue ? 90 : 270,
    right: asBlue ? 270 : 90,
    bottomLeft: asBlue ? 45 : 225,
    bottom: asBlue ? 0 : 180,
    bottomRight: asBlue ? 315 : 135,
  };

  return (
    <div
      // @ts-ignore
      ref={ref}
      className={classNames(
        "top-0 absolute overflow-hidden opacity-80 flex flex-col",
        color
      )}
      style={{ width: props.squareSize, height: props.squareSize }}
    >
      <div className="grid grid-cols-7 gap-2 w-full">
        <div
          className="col-span-2 hover:bg-amber-500  bg-slate-400 -rotate-45"
          onMouseOver={() => setStagedOrientation(angles.topLeft)}
          onClick={(e) => {
            e.stopPropagation();
            props.onChange(angles.topLeft);
          }}
        >
          ▲
        </div>
        <div
          className="col-span-3  hover:bg-amber-500 bg-slate-400"
          onMouseOver={() => setStagedOrientation(angles.top)}
          onClick={(e) => {
            e.stopPropagation();
            props.onChange(angles.top);
          }}
        >
          ▲
        </div>
        <div
          className="col-span-2 hover:bg-amber-500  bg-slate-400 rotate-45"
          onMouseOver={() => setStagedOrientation(angles.topRight)}
          onClick={(e) => {
            e.stopPropagation();
            props.onChange(angles.topRight);
          }}
        >
          ▲
        </div>
      </div>
      <div className="grid grid-cols-7 flex-1 items-center ">
        <div
          className="col-span-2 hover:bg-amber-500  bg-slate-400 -rotate-90 "
          onMouseOver={() => setStagedOrientation(angles.left)}
          onClick={(e) => {
            e.stopPropagation();
            props.onChange(angles.left);
          }}
        >
          ▲
        </div>
        <div
          className="col-span-3"
          style={{
            transform: `rotate(${
              (stagedOrientation + (asBlue ? -180 : 0) + 360) % 360
            }deg)`,
          }}
        >
          {props.children}
        </div>
        <div
          className="col-span-2 hover:bg-amber-500  bg-slate-400 rotate-90"
          onMouseOver={() => setStagedOrientation(angles.right)}
          onClick={(e) => {
            e.stopPropagation();
            props.onChange(angles.right);
          }}
        >
          ▲
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 ">
        <div
          className="col-span-2 hover:bg-amber-500  bg-slate-400 rotate-[-135deg]"
          onMouseOver={() => setStagedOrientation(angles.bottomLeft)}
          onClick={(e) => {
            e.stopPropagation();
            props.onChange(angles.bottomLeft);
          }}
        >
          ▲
        </div>
        <div
          className="col-span-3  hover:bg-amber-500 bg-slate-400 rotate-180"
          onMouseOver={() => setStagedOrientation(angles.bottom)}
          onClick={(e) => {
            e.stopPropagation();
            props.onChange(angles.bottom);
          }}
        >
          ▲
        </div>
        <div
          className="col-span-2 hover:bg-amber-500  bg-slate-400 rotate-[135deg]"
          onMouseOver={() => setStagedOrientation(angles.bottomRight)}
          onClick={(e) => {
            e.stopPropagation();
            props.onChange(angles.bottomRight);
          }}
        >
          ▲
        </div>
      </div>
    </div>
  );
}

const useMouseAngle = () => {
  const [angle, setAngle] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event: any) => {
      if (ref.current) {
        // @ts-ignore
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = event.clientX - centerX;
        const deltaY = event.clientY - centerY;

        let radian = Math.atan2(deltaY, deltaX); // Calculate angle in radians
        let degrees = radian * (180 / Math.PI); // Convert to degrees

        // Adjust the angle to be from the top (clockwise)
        degrees = (degrees + 90 + 360) % 360;

        setAngle(degrees);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return [angle, ref];
};

function useAnyClick(handler: (event: MouseEvent) => void) {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      handler(event);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [handler]);
}
