"use client";

import { useRouter } from "next/navigation";
import { Button } from "./live/Button";
import { PlayOnlineButton } from "./live/PlayOnlineButton";
import { Learn } from "@/components/Learn";
import Header from "@/components/Header";
import LiveGamesList from "./LiveGamesList";
import Leaderboard from "./Leaderboard";
import { Section } from "./learn/page";
import { Community } from "@/components/Community";
import LearnBasics from "./learn/LearnBasics";
import { GHQNight } from "@/components/GHQNight";
import CorrespondenceView from "./CorrespondenceView";
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

  async function startTutorial() {
    router.push("/tutorial/1-hq");
  }

  return (
    <div className="p-2 flex flex-col gap-4 lg:px-48">
      <Header />
      {/* <LatestMessage /> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="col-span-1 flex flex-col gap-2">
          <div className="flex flex-col gap-2 border rounded p-4 bg-slate-50">
            <div className="font-bold text-lg">Play a game</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 justify-center items-center">
              <PlayOnlineButton mode="normandy" />
              <PlayOnlineButton mode="rapid" />
              <Button onClick={startTutorial}>🙋‍♂️ Learn Rules</Button>
              <Button onClick={playLocal}>👨‍💻 Pass n&apos; Play</Button>
              <Button onClick={playBot}>🤖 Play Bot</Button>
              <Button onClick={goLearn}>📚 Puzzles</Button>
            </div>
          </div>

          {/* <div className="border rounded p-4 bg-slate-50 flex flex-col gap-2">
            <Community />
          </div> */}
          <div className="border rounded p-4 bg-slate-50 flex flex-col gap-2">
            <Learn />
          </div>
          <div className="border rounded p-4 bg-slate-50 flex flex-col gap-2">
            <CorrespondenceView />
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-2">
          {/* <GHQNight /> */}
          <div className="border rounded p-4 bg-slate-50">
            <Leaderboard />
          </div>
          <div className="border rounded p-4 bg-slate-50">
            <LiveGamesList />
          </div>
        </div>
      </div>
      <Section heading="Basics">
        <LearnBasics />
      </Section>
    </div>
  );
}

export default App;
