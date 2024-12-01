"use client";

import React, { useMemo } from "react";
import { GHQState, Player } from "@/game/engine";
import { BoardProps } from "boardgame.io/react";
import classNames from "classnames";
import { HistoryLog } from "../../game/HistoryLog";
import EvalBar from "../../game/EvalBar";

import { Button } from "@/app/live/Button";
import { useRouter } from "next/navigation";
import AbortGameButton from "../../game/AbortGameButton";
import Header from "@/components/Header";
import ShareGameDialog from "../../game/ExportGameDialog";
import HowToPlayView from "../../game/HowToPlayView";
import {
  AcceptDrawButton,
  OfferDrawButton,
  ResignButton,
} from "../../game/board";

export default function Sidebar({
  G,
  ctx,
  playerID,
  moves,
  log,
  className,
}: BoardProps<GHQState> & {
  className: string;
}) {
  const router = useRouter();

  const currentPlayerTurn = useMemo(
    () => playerIdToPlayer(ctx.currentPlayer),
    [ctx.currentPlayer]
  );
  const currentPlayer = useMemo(
    () => (playerID === null ? currentPlayerTurn : playerIdToPlayer(playerID)),
    [currentPlayerTurn, playerID]
  );

  const historyEval = useMemo(() => {
    return (
      <>
        <EvalBar evalValue={G.eval} />
        <HistoryLog
          systemMessages={G.historyLog}
          log={log}
          gameover={ctx.gameover}
        />
      </>
    );
  }, [ctx.turn, ctx.gameover]);

  return (
    <div className={classNames("w-full md:w-[450px] bg-white", className)}>
      <Header />
      {historyEval}
      {ctx.gameover ? (
        <div className="flex flex-col items-center justify-center gap-1 justify-center items-center">
          <h2
            className={classNames(
              "text-center font-semibold text-2xl",
              ctx.gameover.status === "DRAW" && "text-gray-800",
              ctx.gameover.status === "WIN" && ctx.gameover.winner === "RED"
                ? "text-red-500"
                : "text-blue-500"
            )}
          >
            {ctx.gameover.status === "DRAW" ? (
              "Draw!"
            ) : (
              <>{ctx.gameover.winner === "RED" ? "Red " : "Blue"} Won!</>
            )}
          </h2>
          {ctx.gameover.reason && ctx.gameover.reason}
          <button
            className="bg-blue-500 text-white py-1 px-2 text-sm rounded hover:bg-blue-600 flex gap-1 items-center"
            onClick={() => router.push("/")}
          >
            🏠 Home
          </button>
          <ShareGameDialog G={G} />
        </div>
      ) : (
        <div
          className={classNames(
            "text-center font-semibold flex items-center flex-col justify-center text-2xl flex-1",
            ctx.currentPlayer === "0" ? "text-red-500" : "text-blue-500"
          )}
        >
          {currentPlayer === currentPlayerTurn ? "Your" : "Their"} Turn
          <div className="text-lg text-gray-600 flex gap-1 justify-center items-center font-medium">
            {3 - ctx.numMoves!} remaining move
            {ctx.numMoves !== 2 ? "s" : ""}{" "}
          </div>
          <div className="flex gap-1 justify-center items-center">
            {currentPlayer === currentPlayerTurn || !G.isOnline ? (
              <>
                {G.drawOfferedBy && G.drawOfferedBy !== ctx.currentPlayer ? (
                  <AcceptDrawButton draw={() => moves.AcceptDraw()} />
                ) : (
                  <OfferDrawButton
                    draw={(offer: boolean) => moves.OfferDraw(offer)}
                  />
                )}
                <ResignButton resign={() => moves.Resign()} />
                <ShareGameDialog G={G} />
              </>
            ) : (
              <>
                <AbortGameButton matchId={G.matchId} />
                <ShareGameDialog G={G} />
              </>
            )}
            {!G.isOnline && (
              <>
                <button
                  className="bg-blue-500 text-white py-1 px-2 text-sm rounded hover:bg-blue-600 flex gap-1 items-center"
                  onClick={() => router.push("/")}
                >
                  🏠 Home
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mt-4">
        <HowToPlayView />
      </div>
    </div>
  );
}

function playerIdToPlayer(playerId: string): Player {
  return playerId === "0" ? "RED" : "BLUE";
}
