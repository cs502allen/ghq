"use client";

import React, { useEffect, useMemo, useState } from "react";
import { GHQState, Player } from "@/game/engine";
import { BoardProps } from "boardgame.io/react";
import { getAllowedMoves, getOpponent } from "../../game/board-moves";

import { updateReserveClick, UserActionState } from "./state";
import Reserve from "./Reserve";
import Board from "./Board";
import classNames from "classnames";
import ControlsView from "./ControlsView";
import useBoard from "./useBoard";
import { useUsernames } from "./useUsernames";

export default function PlayArea(
  props: BoardProps<GHQState> & { className: string }
) {
  const { ctx, G, matchData, playerID, className, moves, log } = props;
  const [userActionState, setUserActionState] = useState<UserActionState>({});
  const currentPlayerTurn = useMemo(
    () => playerIdToPlayer(ctx.currentPlayer),
    [ctx.currentPlayer]
  );
  const currentPlayer = useMemo(
    () => (playerID === null ? currentPlayerTurn : playerIdToPlayer(playerID)),
    [currentPlayerTurn, playerID]
  );
  const { usernames } = useUsernames({ G });

  const possibleAllowedMoves = useMemo(
    () =>
      getAllowedMoves({
        board: G.board,
        redReserve: G.redReserve,
        blueReserve: G.blueReserve,
        currentPlayerTurn,
        thisTurnMoves: G.thisTurnMoves,
      }),
    [G.board, G.redReserve, G.blueReserve, currentPlayerTurn, G.thisTurnMoves]
  );

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
      className={classNames(
        "flex flex-col w-[360px] md:w-[600px] lg:w-[600px] overflow-x-hidden overflow-y-auto",
        className
      )}
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
      />
      <ControlsView
        {...props}
        isMyTurn={currentPlayer === currentPlayerTurn}
        cancel={() => setUserActionState({})}
        replay={() => replay()}
      />
    </div>
  );
}

function playerIdToPlayer(playerId: string): Player {
  return playerId === "0" ? "RED" : "BLUE";
}
