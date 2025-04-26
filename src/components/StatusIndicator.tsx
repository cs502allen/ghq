import { OnlineUser } from "@/lib/types";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";

interface StatusIndicatorProps {
  status: OnlineUser["status"];
  size?: number;
}

export function StatusIndicator({ status, size = 8 }: StatusIndicatorProps) {
  const [open, setOpen] = useState(false);
  const getColor = () => {
    if (status === "online") return "bg-green-500";
    if (status.includes("queue")) return "bg-blue-500";
    if (status === "in game") return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <div
          className={`rounded-full ${getColor()}`}
          style={{ width: size, height: size }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="rounded bg-white px-4 py-2 text-sm shadow-lg"
          sideOffset={5}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          User is {status}
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
