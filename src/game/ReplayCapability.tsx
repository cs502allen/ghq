import { CreateGameReducer } from "boardgame.io/internal";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export default function ReplayCapability({ client }: { client: any }) {
  const [latestLogLength, setLatestLogLength] = useState<number>(0);
  const [currentLogIndex, setCurrentLogIndex] = useState<
    number | "latest" | "init"
  >("latest");

  const reducer = CreateGameReducer({ game: client.game });
  const initialState = client.getInitialState();

  // If new game state comes in, fast forward to latest.
  useEffect(() => {
    const unsub = client.subscribe((state: any) => {
      if (!state?.log) {
        return;
      }

      if (state.log.length > latestLogLength) {
        setLatestLogLength(state.log.length);
        setCurrentLogIndex("latest");
      }
    });

    return () => {
      unsub();
    };
  }, [client, latestLogLength]);

  useEffect(() => {
    if (currentLogIndex === "latest") {
      client.overrideGameState(null);
    }
  }, [client, currentLogIndex]);

  function nonAutomaticLogs(log: any) {
    return log.filter((logEntry: any) => !logEntry.automatic);
  }

  function rewind(logIndex: number) {
    if (!client.log) {
      return;
    }

    const log = nonAutomaticLogs(client.log);
    console.log(log);

    let state = initialState;
    for (let i = 0; i < log.length; i++) {
      const { action, automatic } = log[i];

      if (!automatic) {
        state = reducer(state, action);

        if (logIndex == 0) {
          break;
        }

        logIndex--;
      }
    }
    return { G: state.G, ctx: state.ctx, plugins: state.plugins };
  }

  useHotkeys(
    "down",
    (e) => {
      e.preventDefault();

      if (!client.log) {
        return;
      }

      const log = nonAutomaticLogs(client.log);
      if (currentLogIndex === "init") {
        return;
      }

      const logIndex =
        currentLogIndex === "latest" ? log.length - 1 : currentLogIndex;

      if (logIndex - 1 >= 0) {
        const state = rewind(logIndex - 1);
        setCurrentLogIndex(logIndex - 1);
        client.overrideGameState(state);
      } else if (logIndex === 0) {
        setCurrentLogIndex("init");
        client.overrideGameState(initialState);
      }
    },
    [currentLogIndex]
  );
  useHotkeys(
    "up",
    (e) => {
      e.preventDefault();

      if (!client.log) {
        return;
      }

      if (currentLogIndex === "latest") {
        return;
      }

      if (currentLogIndex === "init") {
        const state = rewind(0);
        setCurrentLogIndex(0);
        client.overrideGameState(state);
        return;
      }

      const log = nonAutomaticLogs(client.log);

      if (currentLogIndex + 1 < log.length) {
        const state = rewind(currentLogIndex + 1);
        setCurrentLogIndex(currentLogIndex + 1);
        client.overrideGameState(state);
      }
    },
    [currentLogIndex]
  );

  return null;
}
