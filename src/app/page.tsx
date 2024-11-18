"use client";

import { useRouter } from "next/navigation";
import { Button } from "./live/Button";
import { PlayOnlineButton } from "./live/PlayOnlineButton";
import { Learn } from "@/components/Learn";
import Header from "@/components/Header";
import LiveGamesList from "./LiveGamesList";
import LatestMessage from "@/components/LatestMessage";
import Leaderboard from "./Leaderboard";

function App() {
  const router = useRouter();

  async function playLocal() {
    router.push("/local");
  }

  async function playBot() {
    router.push("/bot");
  }

  async function goLearn() {
    router.push("/learn");
  }

  return (
    <div className="p-2 flex flex-col gap-4 lg:px-48">
      <Header />
      <LatestMessage />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="col-span-1 flex flex-col gap-2">
          <div className="flex flex-col gap-2 border rounded p-4 bg-slate-50">
            <div className="text-2xl">Play a game</div>
            <div className="flex flex-wrap gap-2 justify-center items-center">
              <PlayOnlineButton mode="blitz" />
              <PlayOnlineButton mode="rapid" />
            </div>
            <div className="flex flex-wrap gap-2 justify-center items-center">
              <Button onClick={playLocal}>👨‍💻 Pass n&apos; Play</Button>
              <Button onClick={playBot}>🤖 Play Bot</Button>
              <Button onClick={goLearn}>📚 Learn</Button>
            </div>
          </div>

          <div className="border rounded p-4 min-h-[400px] bg-slate-50 flex flex-col gap-2">
            <Learn />
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-2">
          <div className="border rounded p-4 bg-slate-50">
            <Leaderboard />
          </div>
          <div className="border rounded p-4 bg-slate-50">
            <LiveGamesList />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
