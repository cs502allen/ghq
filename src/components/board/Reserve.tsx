"use client";

import { GHQState, Player, ReserveFleet } from "@/game/engine";
import CountdownTimer from "@/game/countdown";

import MoveCounter from "../../game/MoveCounter";
import { Ctx } from "boardgame.io";
import { ReserveBank } from "../../game/board";
import { UserActionState } from "./state";

export default function Reserve({
  G,
  ctx,
  player,
  currentPlayer,
  currentPlayerTurn,
  userActionState,
  usernames,
  selectReserve,
}: {
  G: GHQState;
  ctx: Ctx;
  player: Player;
  currentPlayer: Player;
  currentPlayerTurn: Player;
  userActionState: UserActionState;
  usernames: string[];
  selectReserve: (kind: keyof ReserveFleet) => void;
}) {
  return (
    <>
      <div className="items-center justify-center flex py-2 px-1">
        <ReserveBank
          player={player}
          reserve={player === "RED" ? G.redReserve : G.blueReserve}
          selectedKind={
            player === currentPlayerTurn
              ? userActionState.selectedReserve
              : undefined
          }
          selectable={player === currentPlayerTurn && player === currentPlayer}
          selectReserve={selectReserve}
        />
        <div className="ml-4 lg:ml-20 my-2 flex flex-col gap-1">
          <div>
            {usernames[1]} ({G.elos[1]})
          </div>
          <div className="flex gap-2 justify-center items-center">
            <MoveCounter
              numMoves={ctx.numMoves}
              active={currentPlayerTurn === player && !ctx.gameover}
            />
            <CountdownTimer
              active={currentPlayerTurn === player && !ctx.gameover}
              player={player}
              elapsed={player === "RED" ? G.redElapsed : G.blueElapsed}
              startDate={G.turnStartTime}
              totalTimeAllowed={G.timeControl}
            />
          </div>
        </div>
      </div>
    </>
  );
}
