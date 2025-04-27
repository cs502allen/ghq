import { UserBadge } from "../lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useState } from "react";

export default function UserBadgeTag({ badge }: { badge?: UserBadge }) {
  const [open, setOpen] = useState(false);

  if (!badge) {
    return null;
  }

  const emojis: Record<UserBadge, string> = {
    recruit: "🪖️",
    sergeant: "🪖🪖️",
    lieutenant: "🎖️️️️",
    captain: "🎖️️️️🎖️️️️",
    commander: "🎖️️️️🎖️️️️🎖️️️️",
    tralfamadorian: "👽",
  };

  const badgeNames: Record<UserBadge, string> = {
    recruit: "Recruit",
    sergeant: "Sergeant",
    lieutenant: "Lieutenant",
    captain: "Captain",
    commander: "Commander",
    tralfamadorian: "Tralfamadorian",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div>{emojis[badge]}</div>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm">{badgeNames[badge]}</p>
      </PopoverContent>
    </Popover>
  );
}
