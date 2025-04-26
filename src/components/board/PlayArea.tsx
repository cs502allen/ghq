"use client";

import React, { useEffect, useMemo, useState } from "react";
import { GHQState, hasMoveLimitReached, Player } from "@/game/engine";
import { BoardProps } from "boardgame.io/react";
import { getAllowedMoves, getOpponent } from "../../game/board-moves";

import { updateReserveClick, UserActionState } from "./state";
import Reserve from "./Reserve";
import Board from "./Board";
import classNames from "classnames";
import ControlsView from "./ControlsView";
import useBoard from "./useBoard";
import { useUsernames } from "./useUsernames";
import { Settings } from "./SettingsMenu";

export default function PlayArea(
  props: BoardProps<GHQState> & { className: string; settings: Settings }
) {
  const {
    ctx,
    G,
    matchData,
    playerID,
    className,
    moves,
    log,
    settings,
    sendChatMessage,
    chatMessages,
  } = props;
  const [userActionState, setUserActionState] = useState<UserActionState>({});
  const [viewPlayerPref, setViewPlayerPref] = useState<Player>("RED");
  const currentPlayerTurn = useMemo(
    () => playerIdToPlayer(ctx.currentPlayer),
    [ctx.currentPlayer]
  );

  // Note: playerID is null in local play (non-multiplayer, non-bot), also when spectating, replaying, and tutorials.
  const currentPlayer = useMemo(
    () => (playerID === null ? currentPlayerTurn : playerIdToPlayer(playerID)),
    [currentPlayerTurn, playerID]
  );
  const { usernames } = useUsernames({ G });

  const isFlipped = useMemo(() => viewPlayerPref === "BLUE", [viewPlayerPref]);

  useEffect(() => {
    // If G.isPassAndPlayMode, then viewPlayerPref should snap to currentPlayerTurn.
    if (G.isPassAndPlayMode && settings.autoFlipBoard && playerID === null) {
      setViewPlayerPref(currentPlayerTurn);
    } else if (playerID !== null) {
      setViewPlayerPref(playerIdToPlayer(playerID));
    }
  }, [G.isPassAndPlayMode, playerID, currentPlayerTurn, settings]);

  const possibleAllowedMoves = useMemo(() => {
    if (hasMoveLimitReached(ctx)) {
      return [];
    }
    return getAllowedMoves({
      board: G.board,
      redReserve: G.redReserve,
      blueReserve: G.blueReserve,
      currentPlayerTurn,
      thisTurnMoves: G.thisTurnMoves,
    });
  }, [
    G.board,
    G.redReserve,
    G.blueReserve,
    currentPlayerTurn,
    G.thisTurnMoves,
    ctx,
  ]);

  // If the move limit has been reached and user has confirm disabled, automatically skip the turn.
  useEffect(() => {
    if (!settings.confirmTurn && hasMoveLimitReached(ctx)) {
      moves.Skip();
    }
  }, [ctx.numMoves]);

  const { board, mostRecentMove, replay } = useBoard({
    ctx,
    G,
    moves,
    userActionState,
    currentPlayer,
    currentPlayerTurn,
  });

  return (
    <div
      className={
        G.isTutorial
          ? "flex flex-col w-[360px]"
          : classNames(
              "flex flex-col w-[360px] md:w-[600px] lg:w-[600px] overflow-x-hidden overflow-y-auto",
              className
            )
      }
    >
      <Reserve
        G={G}
        ctx={ctx}
        matchData={matchData}
        player={getOpponent(currentPlayer)}
        currentPlayer={currentPlayer}
        currentPlayerTurn={currentPlayerTurn}
        usernames={usernames}
        userActionState={userActionState}
        selectReserve={(kind) =>
          setUserActionState((userActionState) =>
            updateReserveClick(userActionState, kind, possibleAllowedMoves)
          )
        }
        sendChatMessage={(message) =>
          sendChatMessage({ message, time: Date.now() })
        }
        chatMessages={chatMessages}
      />
      <Board
        G={G}
        ctx={ctx}
        log={log}
        board={board}
        mostRecentMove={mostRecentMove}
        userActionState={userActionState}
        setUserActionState={setUserActionState}
        possibleAllowedMoves={possibleAllowedMoves}
        currentPlayer={currentPlayer}
        currentPlayerTurn={currentPlayerTurn}
        isFlipped={isFlipped}
      />
      <Reserve
        G={G}
        ctx={ctx}
        matchData={matchData}
        player={currentPlayer}
        currentPlayer={currentPlayer}
        currentPlayerTurn={currentPlayerTurn}
        usernames={usernames}
        userActionState={userActionState}
        selectReserve={(kind) =>
          setUserActionState((userActionState) =>
            updateReserveClick(userActionState, kind, possibleAllowedMoves)
          )
        }
        sendChatMessage={(message) =>
          sendChatMessage({ message, time: Date.now() })
        }
        chatMessages={chatMessages}
      />
      <ControlsView
        {...props}
        isMyTurn={currentPlayer === currentPlayerTurn}
        hasMoveLimitReached={
          currentPlayer === currentPlayerTurn && hasMoveLimitReached(ctx)
        }
        cancel={() => setUserActionState({})}
        replay={() => replay()}
      />
    </div>
  );
}

function playerIdToPlayer(playerId: string): Player {
  return playerId === "0" ? "RED" : "BLUE";
}
