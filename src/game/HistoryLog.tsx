import React from "react";
import { GHQState } from "@/game/engine";
import { BoardProps } from "boardgame.io/react";
import { HistoryState } from "@/game/move-history-plugin";
import { coordinateToAlgebraic, degreesToCardinal } from "./notation";
import classNames from "classnames";
import { LogEntry } from "boardgame.io";

export function HistoryLog({
  systemMessages,
  log,
}: {
  systemMessages: HistoryState;
  log: BoardProps<GHQState>["log"];
}) {
  const filteredLog: LogEntry[] = [];

  const undoneMoves: LogEntry[] = [];
  for (const entry of log) {
    if (entry.action.type === "UNDO") {
      const lastMove = filteredLog.pop();
      lastMove && undoneMoves.push(lastMove);
    } else if (entry.action.type === "REDO") {
      const lastUndoneMove = undoneMoves.pop();
      lastUndoneMove && filteredLog.push(lastUndoneMove);
    } else {
      filteredLog.push(entry);
    }
  }

  const playerMessages = filteredLog
    .filter((entry) => entry.action.type === "MAKE_MOVE")
    .map((entry) => {
      const { playerID, type, args } = entry.action.payload;
      const player = playerID === "0" ? "Red" : "Blue";
      let description = type;
      const pieceType = entry?.metadata?.pieceType?.toLowerCase() ?? "piece";
      let isCapture = false;

      if (type === "Move") {
        const [from, to] = args;
        const fromNotation = coordinateToAlgebraic(from);
        const toNotation = coordinateToAlgebraic(to);
        description = `moved ${pieceType} from ${fromNotation} to ${toNotation}`;

        const capture = entry?.metadata?.capturePreference;
        if (capture) {
          const captureType = entry?.metadata?.capturedPieceType ?? "piece";
          const captureNotation = coordinateToAlgebraic(capture);
          description += ` and captured ${captureType.toLowerCase()} on ${captureNotation}`;
          isCapture = true;
        }
      } else if (type === "Reinforce") {
        const [kind, at] = args;
        const atNotation = coordinateToAlgebraic(at);
        description = `reinforced with ${kind.toLowerCase()} at ${atNotation}`;
      } else if (type === "MoveAndOrient") {
        const [from, to, orientation] = args;
        const fromNotation = coordinateToAlgebraic(from);
        const toNotation = coordinateToAlgebraic(to);
        description = `moved ${pieceType} from ${fromNotation} to ${toNotation} and rotated ${degreesToCardinal(
          orientation
        )}`;
      } else if (type === "ChangeOrientation") {
        const [at, orientation] = args;
        const atNotation = coordinateToAlgebraic(at);
        description = `rotated ${pieceType} at ${atNotation} ${degreesToCardinal(
          orientation
        )}`;
      } else if (type === "Skip") {
        description = "skipped the remainder of their turn";
      } else if (type === "Resign") {
        description = "resigned";
      }
      return {
        turn: entry.turn,
        message: `${player} ${description}`,
        isCapture,
      };
    });

  const systemCaptureMessages = systemMessages.log.map(
    ({ turn, isCapture, playerId, captured, message }) => {
      if (message) {
        return { turn, message, isCapture };
      }

      if (isCapture && captured) {
        const player = playerId === "0" ? "Red" : "Blue";
        const clearedSquares = captured.map(({ coordinate }) => coordinate);

        return {
          turn,
          isCapture,
          message: `${player} artillery destroyed piece${
            clearedSquares.length > 1 ? "s" : ""
          } at ${clearedSquares
            .map((coord) => coordinateToAlgebraic(coord))
            .join(", ")}`,
        };
      }

      return { turn, isCapture, message: "" };
    }
  );

  const combinedMessages = [...systemCaptureMessages, ...playerMessages].sort(
    (a, b) => a.turn - b.turn
  );

  // TODO(tyler): figure out why duplicate messages are coming through
  const deduplicatedMessages = combinedMessages.filter(
    (msg, index, self) =>
      index === self.findIndex((m) => m.message === msg.message)
  );

  React.useEffect(() => {
    const messagesDiv = document.querySelector("#history-log-list");
    if (messagesDiv) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  }, [playerMessages]);

  return (
    <div className="flex flex-col gap-1 p-2 h-[800px]">
      <div className="font-bold text-lg">Activity</div>
      <div
        id="history-log-list"
        className="overflow-y-auto border p-1 h-[600px]"
      >
        {deduplicatedMessages.map((msg) => (
          <div
            key={msg.message}
            className={classNames(msg.isCapture && "text-red-600")}
          >
            <span className="text-gray-500">{msg.turn} </span>
            {msg.message}
          </div>
        ))}
      </div>
    </div>
  );
}
