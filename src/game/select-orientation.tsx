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
    const orientation = getClosestOrientation(angle as number);

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

  return (
    <div
      // @ts-ignore
      ref={ref}
      className={classNames(
        "top-0 absolute overflow-hidden opacity-80 flex items-center justify-center select-none",
        color
      )}
      style={{
        width: props.squareSize,
        height: props.squareSize,
        touchAction: "none",
      }}
    >
      <div
        className="select-none"
        key={stagedOrientation}
        style={{
          transform: `rotate(${
            (stagedOrientation + (asBlue ? -180 : 0) + 360) % 360
          }deg)`,
        }}
      >
        {props.children}
      </div>
    </div>
  );
}

const useMouseAngle = () => {
  const [angle, setAngle] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (ref.current) {
        // @ts-ignore
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;

        let radian = Math.atan2(deltaY, deltaX); // Calculate angle in radians
        let degrees = radian * (180 / Math.PI); // Convert to degrees

        // Adjust the angle to be from the top (clockwise)
        degrees = (degrees + 90 + 360) % 360;

        setAngle(degrees);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      handleMove(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return [angle, ref];
};

function useAnyClick(handler: (event: MouseEvent | TouchEvent) => void) {
  useEffect(() => {
    const handleMouseClick = (event: MouseEvent) => {
      handler(event);
    };

    const handleTouchClick = (event: TouchEvent) => {
      handler(event);
    };

    document.addEventListener("mouseup", handleMouseClick);
    document.addEventListener("touchend", handleTouchClick);

    return () => {
      document.removeEventListener("mouseup", handleMouseClick);
      document.removeEventListener("touchend", handleTouchClick);
    };
  }, [handler]);
}
