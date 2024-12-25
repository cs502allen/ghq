import { frames } from "@/app/tutorial/frames";
import { redirect } from "next/navigation";
import Link from "next/link";

import { TutorialBoard } from "@/app/tutorial/tutorial-board";
import { LatestMoveProvider } from "@/components/LatestMoveContext";

export async function generateStaticParams() {
  return frames;
}

export default async function Page({ params }: any) {
  const frame = (await params).frame;

  const tutorialFrame = frames.find((i) => i.slugWithIndex === frame)!;

  const index = frames.indexOf(tutorialFrame);

  if (!tutorialFrame) {
    redirect("/");
  }

  const next = frames[index + 1]?.slugWithIndex || false;

  const nextLink = `/tutorial/${next}`;
  return (
    <div className="max-w-4xl mx-auto pt-10  text-center">
      {next ? (
        <Link className="tutorial-link" href={nextLink}>
          Next ►
        </Link>
      ) : (
        <Link className="tutorial-link" href={`/bot`}>
          Play your first game against a bot!
        </Link>
      )}

      <div className="p-5 bg-gray-200">
        <h1 className="text-2xl mb-4  font-bold">{tutorialFrame.heading}</h1>
        <h3 className="text-xl px-20  ">{tutorialFrame.details}</h3>
      </div>
      <LatestMoveProvider key={tutorialFrame.slugWithIndex}>
        <TutorialBoard slug={tutorialFrame.slug} nextLink={nextLink} />
      </LatestMoveProvider>
    </div>
  );
}
