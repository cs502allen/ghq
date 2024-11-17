"use client";

import { Button } from "./Button";
import { useAuth } from "@clerk/nextjs";
import { useMatchmaking } from "@/components/MatchmakingProvider";

export function PlayOnlineButton() {
  const { isSignedIn } = useAuth();
  const { startMatchmaking } = useMatchmaking();

  function openSignInDialog() {
    if (!isSignedIn) {
      const signInButton = document.getElementById("sign-in-button");
      if (signInButton) {
        signInButton.click();
      }
    }
  }

  async function playOnline() {
    if (!isSignedIn) {
      openSignInDialog();
      return;
    }

    startMatchmaking();
  }

  return (
    <>
      <Button onClick={playOnline} loadingText="Searching...">
        🌎 Play Online
      </Button>
    </>
  );
}
