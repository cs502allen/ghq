import React, { useEffect, useState } from "react";
import { Player } from "@/game/engine";
import classNames from "classnames";

const CountdownTimer = ({
  startDate,
  active,
  totalTimeAllowed,
  elapsed,
  player,
}: {
  active: boolean;
  player: Player;
  elapsed: number;
  startDate: number;
  totalTimeAllowed: number;
}) => {
  const [remainingTime, setRemainingTime] = useState(
    Math.max(0, totalTimeAllowed - elapsed - (Date.now() - startDate))
  );

  useEffect(() => {
    // If the turn is not active, exit the effect without starting the countdown.
    if (!active) return;

    // Set up the countdown interval only when `active` is true.
    const intervalId = setInterval(() => {
      const elapsedTime = Date.now() - startDate;
      const newRemainingTime = Math.max(
        0,
        totalTimeAllowed - elapsed - elapsedTime
      );
      setRemainingTime(newRemainingTime);

      if (newRemainingTime === 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    // Clean up interval when `active` becomes false or when the component unmounts.
    return () => clearInterval(intervalId);
  }, [startDate, totalTimeAllowed, elapsed, active]);

  const formatTime = (timeInMs: number) => {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="text-center flex justify-center items-center">
      <div
        className={classNames(
          active ? "bg-gray-900" : "bg-gray-500",
          "rounded-xl px-4 text-2xl font-mono",
          player === "BLUE" ? "text-blue-300" : "text-red-300"
        )}
      >
        <p>{formatTime(remainingTime)}</p>
      </div>
    </div>
  );
};

export default CountdownTimer;
