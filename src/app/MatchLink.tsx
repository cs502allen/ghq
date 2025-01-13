"use client";

import { DateTime } from "luxon";
import classNames from "classnames";
import Link from "next/link";
import { MatchModel } from "@/lib/types";

export function MatchLink({ game }: { game: MatchModel }) {
  return (
    <Link
      href={`/live/${game.id}`}
      className="py-2 px-3 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md flex justify-between"
    >
      <div className="tracking-tight">
        <div className="flex gap-1">
          <div
            className={classNames(
              game.player1 === game.winner && "text-green-700"
            )}
          >
            {game.player1}
          </div>{" "}
          ({game.player1Elo})<span className="text-gray-500"> vs.</span>
          <div
            className={classNames(
              game.player2 === game.winner && "text-green-700"
            )}
          >
            {game.player2}
          </div>{" "}
          ({game.player2Elo})
        </div>
      </div>

      <div className="flex gap-1 items-center text-sm">
        <div>{(game.status ?? "ongoing").toLowerCase()}</div>

        <div className="text-gray-500">
          {DateTime.fromISO(game.createdAt).toRelative()}
        </div>
      </div>
    </Link>
  );
}
