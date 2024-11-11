"use client";

import { useRouter } from "next/navigation";
import { Button } from "./Button";
import MatchmakingModal from "./MatchmakingModal";
import { useCallback, useEffect, useState } from "react";
import { API_URL } from "./config";
import { useAuth, useUser } from "@clerk/nextjs";
import { ghqFetch } from "@/lib/api";

interface MatchmakingData {
  match: {
    id: string;
    playerId: string;
    credentials: string;
  };
}

export function PlayOnlineButton({
  openSignInDialog,
}: {
  openSignInDialog: () => void;
}) {
  const router = useRouter();
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const { isSignedIn, getToken } = useAuth();

  const checkMatchmaking = useCallback(async () => {
    try {
      const data = await ghqFetch<MatchmakingData>({
        url: `${API_URL}/matchmaking`,
        getToken,
        method: "POST",
      });
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
  }, [router]);

  async function playOnline() {
    if (!isSignedIn) {
      openSignInDialog();
      return;
    }

    setIsMatchmaking(true);
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMatchmaking) {
      checkMatchmaking();
      interval = setInterval(() => checkMatchmaking(), 2000); // Poll every 2 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMatchmaking, checkMatchmaking]);

  async function cancelMatchmaking() {
    setIsMatchmaking(false);
    ghqFetch({ url: `${API_URL}/matchmaking`, getToken, method: "DELETE" });
  }

  return (
    <>
      <Button onClick={playOnline} loadingText="Searching...">
        🌎 Play Online
      </Button>
      {isMatchmaking && <MatchmakingModal onCancel={cancelMatchmaking} />}
    </>
  );
}
