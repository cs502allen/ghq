import { CreateGameReducer } from "boardgame.io/internal";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export default function MultiplayerReplayCapability({
  offlineClient,
  onlineClient,
  setUseOnlineGameClient,
  disableReplays = true,
}: {
  offlineClient: any;
  onlineClient: any;
  setUseOnlineGameClient: any;
  disableReplays?: boolean;
}) {
  const [latestLogLength, setLatestLogLength] = useState<number>(0);
  const [currentLogIndex, setCurrentLogIndex] = useState<
    number | "latest" | "init"
  >("latest");
  const [initialState, setInitialState] = useState<any | null>(null);

  // If new game state comes in, fast forward to latest.
  useEffect(() => {
    const unsub = onlineClient.subscribe((state: any) => {
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
  }, [onlineClient, latestLogLength]);

  useEffect(() => {
    if (currentLogIndex === "latest") {
      setUseOnlineGameClient(true);
      offlineClient.overrideGameState(null);
    }
  }, [offlineClient, currentLogIndex]);

  function nonAutomaticLogs(log: any) {
    let moveStack: any[] = [];
    let undoStack: any[] = [];
    const result: any[] = [];
    let currentTurn = -1;

    for (const logEntry of log) {
      if (logEntry.automatic) {
        continue;
      }

      if (logEntry.turn !== currentTurn) {
        result.push(...moveStack);
        moveStack = [];
        undoStack = [];
        currentTurn = logEntry.turn;
      }

      // Filter out any moves that were undone.
      if (logEntry.action.type === "UNDO") {
        undoStack.push(moveStack.pop());
      } else if (logEntry.action.type === "REDO") {
        moveStack.push(undoStack.pop());
      } else {
        moveStack.push(logEntry);
      }
    }

    result.push(...moveStack);
    return result;
  }

  // This function gets the next log index to move to.
  // It skips over GAME_EVENT and SKIP moves.
  function getNextLogIndex(
    log: any[],
    currentIndex: number,
    direction: 1 | -1
  ): number {
    const nextIndex = currentIndex + direction;

    if (nextIndex < 0) {
      return -1;
    }
    if (nextIndex >= log.length) {
      return log.length;
    }

    const nextLogEntry = log[nextIndex];
    if (nextLogEntry.action.type === "GAME_EVENT") {
      return getNextLogIndex(log, nextIndex, direction);
    }

    if (
      nextLogEntry.action.type === "MAKE_MOVE" &&
      nextLogEntry.action.payload.type === "Skip"
    ) {
      return getNextLogIndex(log, nextIndex, direction);
    }

    return nextIndex;
  }

  const rewind = (logIndex: number) => {
    if (!onlineClient.log || !offlineClient) {
      return;
    }

    const initialState = offlineClient.getInitialState();

    // Copy over some of the online state that the offline version doesn't have.
    const onlineInitialState = onlineClient.initialState;
    initialState.G = {
      ...initialState.G,
      userIds: onlineInitialState?.G?.userIds,
      elos: onlineInitialState?.G?.elos,
      matchId: onlineInitialState?.G?.matchId,
      timeControl: onlineInitialState?.G?.timeControl,
      bonusTime: onlineInitialState?.G?.bonusTime,
      isOnline: true,
      isReplayMode: true,
      variant: onlineInitialState?.G?.variant,
      board: onlineInitialState?.G?.board,
      redReserve: onlineInitialState?.G?.redReserve,
      blueReserve: onlineInitialState?.G?.blueReserve,
      enforceZoneOfControl: onlineInitialState?.G?.enforceZoneOfControl,
    };
    setInitialState(initialState);

    // We made a change to the game engine on 2025-04-24 that changes max moves from 3 to 4.
    // This is a fix for replays to ensure that games played before this change are still replayable.
    if (!onlineInitialState?.G?.has4MovesPerTurn) {
      onlineClient.game.turn.maxMoves = 3;
    }

    offlineClient.log = onlineClient.log;
    const log = nonAutomaticLogs(offlineClient.log);
    const reducer = CreateGameReducer({ game: offlineClient.game });

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
  };

  useHotkeys(
    "down",
    (e) => {
      e.preventDefault();

      if (disableReplays) {
        return;
      }

      if (!onlineClient.log) {
        return;
      }

      const log = nonAutomaticLogs(onlineClient.log);
      if (currentLogIndex === "init") {
        return;
      }

      const currentIndex =
        currentLogIndex === "latest" ? log.length - 1 : currentLogIndex;
      const nextIndex = getNextLogIndex(log, currentIndex, -1);

      if (nextIndex >= 0) {
        const state = rewind(nextIndex);
        setCurrentLogIndex(nextIndex);
        offlineClient.overrideGameState(state);
      } else {
        setCurrentLogIndex("init");
        offlineClient.overrideGameState(initialState);
      }

      setUseOnlineGameClient(false);
    },
    [currentLogIndex, disableReplays]
  );
  useHotkeys(
    "up",
    (e) => {
      e.preventDefault();

      if (disableReplays) {
        return;
      }

      if (!onlineClient.log) {
        return;
      }

      if (currentLogIndex === "latest") {
        return;
      }

      if (currentLogIndex === "init") {
        const state = rewind(0);
        setCurrentLogIndex(0);
        offlineClient.overrideGameState(state);
        return;
      }

      const log = nonAutomaticLogs(onlineClient.log);
      const nextIndex = getNextLogIndex(log, currentLogIndex, 1);

      if (nextIndex < log.length) {
        const state = rewind(nextIndex);
        setCurrentLogIndex(nextIndex);
        offlineClient.overrideGameState(state);
      } else {
        setCurrentLogIndex("latest");
      }

      setUseOnlineGameClient(false);
    },
    [currentLogIndex, disableReplays]
  );

  useEffect(() => {
    const handleHistoryLogTurnClick = (event: CustomEvent) => {
      if (disableReplays) {
        return;
      }

      if (!onlineClient.log) {
        return;
      }

      const log = nonAutomaticLogs(onlineClient.log);
      const targetTurn = event.detail.turn;

      let targetIndex = -1;
      for (let i = 0; i < log.length; i++) {
        if (log[i].turn === targetTurn) {
          targetIndex = i;
          break;
        }
      }

      if (targetIndex >= 0) {
        const state = rewind(targetIndex);
        setCurrentLogIndex(targetIndex);
        offlineClient.overrideGameState(state);
        setUseOnlineGameClient(false);
      }
    };

    window.addEventListener(
      "historyLogTurnClick",
      handleHistoryLogTurnClick as EventListener
    );

    return () => {
      window.removeEventListener(
        "historyLogTurnClick",
        handleHistoryLogTurnClick as EventListener
      );
    };
  }, [disableReplays, onlineClient.log, offlineClient, setUseOnlineGameClient]);

  return null;
}
