"use client";

import { useRouter } from "next/navigation";
import { Button } from "./Button";
import MatchmakingModal from "./MatchmakingModal";
import { useCallback, useEffect, useState } from "react";
import { API_URL } from "./config";

export function PlayOnlineButton() {
  const router = useRouter();
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [userId] = useState<string>(
    (typeof localStorage !== "undefined" && localStorage.getItem("userId")) ||
      ""
  );

  const checkMatchmaking = useCallback(
    async (userId: string) => {
      try {
        const response = await fetch(
          `${API_URL}/matchmaking?userId=${userId}`,
          {
            method: "POST",
          }
        );
        const data = await response.json();
        if (data.match) {
          setIsMatchmaking(false);
          const playerId = data.match.playerId;
          localStorage.setItem(
            `credentials:${data.match.id}:${playerId}`,
            data.match.credentials
          );
          router.push(`/live/${data.match.id}?playerId=${playerId}`);
        }
      } catch (error) {
        console.error("Error polling matchmaking API:", error);
      }
    },
    [router]
  );

  async function playOnline() {
    if (!userId) {
      alert("User ID is required");
      return;
    }

    setIsMatchmaking(true);
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMatchmaking) {
      checkMatchmaking(userId);
      interval = setInterval(() => checkMatchmaking(userId), 2000); // Poll every 2 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMatchmaking, userId, checkMatchmaking]);

  async function cancelMatchmaking() {
    setIsMatchmaking(false);
    fetch(`${API_URL}/matchmaking?userId=${userId}`, {
      method: "DELETE",
    });
  }

  useEffect(() => {
    localStorage.setItem("userId", userId);
  }, [userId]);

  return (
    <>
      <Button onClick={playOnline} loadingText="Searching...">
        🌎 Play online
      </Button>
      {isMatchmaking && <MatchmakingModal onCancel={cancelMatchmaking} />}
    </>
  );
}
