"use client";

import { useEffect, useState } from "react";
import Leaderboard from "./Leaderboard";
import Players from "./Players";
import { cn } from "@/lib/utils";
import { API_URL } from "./live/config";
import { UsersOnline } from "@/lib/types";
import { ghqFetch } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";

export default function PlayersTab() {
  const { isSignedIn, getToken } = useAuth();
  const [tab, setTab] = useState<"leaderboard" | "players">("leaderboard");
  const [usersOnline, setUsersOnline] = useState<UsersOnline | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    ghqFetch<UsersOnline>({
      url: `${API_URL}/users/online`,
      getToken,
      method: "GET",
    }).then((data) => {
      setUsersOnline(data);
    });
  }, [isSignedIn]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-4 justify-center">
        <button
          onClick={() => setTab("leaderboard")}
          className={cn(tab === "leaderboard" && "font-bold")}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setTab("players")}
          className={cn(
            "flex flex-row gap-1 items-center",
            tab === "players" && "font-bold"
          )}
        >
          Online
          <span className="text-sm">
            {usersOnline?.users.length && `(${usersOnline.users.length})`}
          </span>
        </button>
      </div>
      {tab === "leaderboard" && <Leaderboard />}
      {tab === "players" && <Players usersOnline={usersOnline} />}
    </div>
  );
}
