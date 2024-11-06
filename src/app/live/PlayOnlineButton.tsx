"use client";

import { useRouter } from "next/navigation";
import { Button } from "./Button";
import MatchmakingModal from "./MatchmakingModal";
import { useCallback, useEffect, useState } from "react";
import { API_URL } from "./config";

export function PlayOnlineButton() {
  const router = useRouter();
  const [isMatchmaking, setIsMatchmaking] = useState(false);

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
          const playerId = data.match.playerId;
          localStorage.setItem(
            `credentials:${data.match.id}:${playerId}`,
            data.match.credentials
          );
          router.push(`/live/${data.match.id}?playerId=${playerId}`);
          setIsMatchmaking(false);
        }
      } catch (error) {
        console.error("Error polling matchmaking API:", error);
      }
    },
    [router]
  );

  async function playOnline() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User ID is required");
      return;
    }

    setIsMatchmaking(true);
  }

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      return;
    }

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
  }, [isMatchmaking, checkMatchmaking]);

  async function cancelMatchmaking() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      return;
    }

    setIsMatchmaking(false);
    fetch(`${API_URL}/matchmaking?userId=${userId}`, {
      method: "DELETE",
    });
  }

  return (
    <>
      <Button onClick={playOnline} loadingText="Searching...">
        🌎 Play online
      </Button>
      {isMatchmaking && <MatchmakingModal onCancel={cancelMatchmaking} />}
    </>
  );
}
