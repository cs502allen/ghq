import React, { PropsWithChildren, useCallback, useState } from "react";

function LongPressTD(
  props: PropsWithChildren<
    React.TdHTMLAttributes<HTMLTableCellElement> & {
      durationMS: number;
      onLongPress?: () => void;
    }
  >
) {
  const { durationMS, onLongPress, ...otherProps } = props;

  const [timer, setTimer] = useState<NodeJS.Timeout | null | "fired">(null);

  const runAndClear = useCallback(() => {
    setTimer("fired");
    if (onLongPress) {
      onLongPress();
    }
  }, [setTimer, onLongPress]);

  // Start the timer when the mouse/touch is down
  const startPressTimer = () => {
    const newTimer = setTimeout(runAndClear, durationMS);
    setTimer(newTimer);
  };

  // Clear the timer when the mouse/touch is released
  const cancelPressTimer = (event: any) => {
    if (timer === "fired") {
      // do nothing
    } else if (timer) {
      clearTimeout(timer);
      setTimer(null);
      props.onClick && props.onClick(event);
    }
  };

  return (
    <td
      className="bg-green-50 no-action "
      onMouseDown={startPressTimer}
      onMouseUp={cancelPressTimer}
      onMouseLeave={cancelPressTimer}
      onTouchStart={startPressTimer}
      onTouchEnd={cancelPressTimer}
      {...otherProps}
      // override empty since we're calling it above
      onClick={undefined}
    >
      {props.children}
    </td>
  );
}

export default LongPressTD;
