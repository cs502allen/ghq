"use client";

import { DateTime } from "luxon";
import classNames from "classnames";
import Link from "next/link";
import { MatchModel } from "@/lib/types";

export function MatchLink({ game }: { game: MatchModel }) {
  return (
    <Link
      href={`/live/${game.id}`}
      className="p-1 bg-white border border-white hover:border-blue-700 flex justify-between hover:bg-blue-100 rounded"
    >
      <div className="tracking-tight">
        <div className="flex gap-1 items-center">
          <div
            className={classNames(
              game.player1 === game.winner && "text-green-700"
            )}
          >
            {game.player1}
          </div>{" "}
          <span className="text-xs">({game.player1Elo})</span>
          <span className="text-gray-500"> vs.</span>
          <div
            className={classNames(
              game.player2 === game.winner && "text-green-700"
            )}
          >
            {game.player2}
          </div>{" "}
          <span className="text-xs">({game.player2Elo})</span>
        </div>
      </div>

      <div className="flex gap-1 items-center text-xs">
        <div className="text-gray-600">
          {DateTime.fromISO(game.createdAt).toRelative()}
        </div>
      </div>
    </Link>
  );
}
