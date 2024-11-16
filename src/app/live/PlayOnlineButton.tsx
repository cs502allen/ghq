"use client";

import { Button } from "./Button";
import { useAuth } from "@clerk/nextjs";
import { useMatchmaking } from "@/components/MatchmakingProvider";

export function PlayOnlineButton({
  openSignInDialog,
}: {
  openSignInDialog: () => void;
}) {
  const { isSignedIn } = useAuth();
  const { startMatchmaking } = useMatchmaking();

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
