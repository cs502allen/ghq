"use client";

import { ReactNode, useEffect } from "react";
import { toast } from "sonner";

interface Message {
  title: string;
  description: ReactNode;
}

const latestMessage = "welcome";

const messages: Record<string, Message> = {
  welcome: {
    title: "Welcome to GHQ",
    description: (
      <div className="flex flex-col gap-2">
        <div>This week is the official launch of playghq.com!</div>

        <div>
          We love Vonnegut and online games, and wanted to share the recently
          released GHQ game with more people.
        </div>
        <div>Hope you enjoy!</div>
        <div>Features:</div>
        <div>
          <div className="pl-4">
            <div>★ Learn how to play</div>
            <div>★ Play online with a random opponent</div>
            <div>★ Play locally with a friend</div>
            <div>★ Play against a very bad bot</div>
          </div>
        </div>
        <div>
          Open an issue on{" "}
          <a
            target="_blank"
            href="https://github.com/acunniffe/ghq"
            className="text-blue-600 hover:text-blue-400"
          >
            GitHub
          </a>{" "}
          if you have any feedback!
        </div>

        <div>- Aidan and Tyler</div>
      </div>
    ),
  },
};

export default function LatestMessage() {
  const message = messages[latestMessage];
  useEffect(() => {
    if (localStorage.getItem("viewedLatestMessage") === latestMessage) {
      return;
    }

    setTimeout(() => {
      toast(message.title, {
        duration: Infinity,
        closeButton: true,
        description: message.description,
        onDismiss: () => {
          localStorage.setItem("viewedLatestMessage", latestMessage);
        },
      });
    });
  }, []);

  return null;
}
