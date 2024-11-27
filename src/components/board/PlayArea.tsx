"use client";

import React, { useMemo, useState } from "react";
import { GHQState, Player } from "@/game/engine";
import { BoardProps } from "boardgame.io/react";
import { getAllowedMoves, getOpponent } from "../../game/board-moves";

import { updateReserveClick, UserActionState } from "./state";
import Reserve from "./Reserve";
import Board from "./Board";
import classNames from "classnames";

export default function PlayArea(
  props: BoardProps<GHQState> & { className: string }
) {
  const { ctx, G, matchData, playerID, className } = props;
  const [userActionState, setUserActionState] = useState<UserActionState>({});
  const currentPlayerTurn = useMemo(
    () => playerIdToPlayer(ctx.currentPlayer),
    [ctx.currentPlayer]
  );
  const currentPlayer = useMemo(
    () => (playerID === null ? currentPlayerTurn : playerIdToPlayer(playerID)),
    [currentPlayerTurn, playerID]
  );
  const usernames = ["Player 1", "Player 2"];
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
        {...props}
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
    </div>
  );
}

function playerIdToPlayer(playerId: string): Player {
  return playerId === "0" ? "RED" : "BLUE";
}
