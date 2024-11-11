"use client";

import { useRouter } from "next/navigation";
import { Button } from "./live/Button";
import { PlayOnlineButton } from "./live/PlayOnlineButton";
import { useAuth } from "@clerk/nextjs";
import { Learn } from "@/components/Learn";
import Header from "@/components/Header";
import LiveGamesList from "./LiveGamesList";

function App() {
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();

  async function playLocal() {
    router.push("/local");
  }

  async function playBot() {
    router.push("/bot");
  }

  async function goLearn() {
    router.push("/learn");
  }

  function openSignInDialog() {
    if (!isSignedIn) {
      const signInButton = document.getElementById("sign-in-button");
      if (signInButton) {
        signInButton.click();
      }
    }
  }

  return (
    <div className="p-2 flex flex-col gap-4 lg:px-48">
      <Header />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="col-span-2 border rounded p-4 bg-slate-50 lg:order-1 order-2">
          <Learn />
        </div>

        <div className="col-span-1 flex flex-col gap-2 lg:order-2 order-1">
          <div className="flex flex-col gap-2 border rounded p-4 bg-slate-50">
            <div className="text-2xl">Play a game</div>
            <div className="flex flex-wrap gap-2 justify-center items-center">
              <PlayOnlineButton openSignInDialog={openSignInDialog} />
              <Button onClick={playLocal}>👨‍💻 Pass n&apos; Play</Button>
              <Button onClick={playBot}>🤖 Play Bot</Button>
              <Button onClick={goLearn}>📚 Learn</Button>
            </div>
          </div>

          <div className="border rounded p-4 min-h-[400px] bg-slate-50 flex flex-col gap-2">
            <LiveGamesList />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
