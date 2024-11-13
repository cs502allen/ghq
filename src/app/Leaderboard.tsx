"use client";

import { API_URL } from "./live/config";
import { ghqFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface User {
  id: string;
  username: string;
  elo: number;
}

export default function Leaderboard() {
  const { isSignedIn, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);

    ghqFetch<{ users: User[] }>({
      url: `${API_URL}/leaderboard`,
      getToken,
      method: "GET",
    })
      .then((data) => {
        setUsers(data.users ?? []);
      })
      .finally(() => setLoading(false));
  }, [isSignedIn]);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-2xl">Leaderboard</div>

      {loading && (
        <div className="flex flex-col gap-2">
          <div className="py-2 px-3 bg-gray-300 animate-pulse border border-gray-200 rounded-lg h-8"></div>
          <div className="py-2 px-3 bg-gray-300 animate-pulse border border-gray-200 rounded-lg h-8"></div>
          <div className="py-2 px-3 bg-gray-300 animate-pulse border border-gray-200 rounded-lg h-8"></div>
        </div>
      )}

      <div className="flex flex-col">
        {users.map((user: User) => (
          <div
            key={user.id}
            className="py-1 px-2 border-gray-200 rounded-lg hover:shadow hover:bg-white flex justify-between"
          >
            <div>{user.username ?? "Anonymous"}</div>
            <div>{user.elo}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
