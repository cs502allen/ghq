"use client";

import { Button } from "./Button";
import { useAuth } from "@clerk/nextjs";
import { useMatchmaking } from "@/components/MatchmakingProvider";
import { TIME_CONTROLS } from "@/game/constants";

export function PlayOnlineButton({
  mode,
}: {
  mode: keyof typeof TIME_CONTROLS;
}) {
  const { isSignedIn } = useAuth();
  const { startMatchmaking } = useMatchmaking();

  const timeControl = TIME_CONTROLS[mode];

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

    startMatchmaking(mode);
  }

  return (
    <>
      <Button onClick={playOnline} loadingText="Searching...">
        🌎 Play {toTitleCase(mode)}{" "}
        <span className="font-medium text-sm">
          ({timeControl.time / 60 / 1000}+{timeControl.bonus / 1000})
        </span>
      </Button>
    </>
  );
}

function toTitleCase(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}
