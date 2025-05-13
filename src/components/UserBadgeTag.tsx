import { badgeToGamesPlayed, UserBadge } from "../lib/types";

export default function UserBadgeTag({
  showTitle,
  badge,
}: {
  showTitle?: boolean;
  badge?: UserBadge;
}) {
  if (!badge) {
    return null;
  }

  const emojis: Record<UserBadge, string> = {
    recruit: "🔫",
    sergeant: "🪖️",
    lieutenant: "🎖️️️️",
    captain: "⭐",
    commander: "💫",
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
    <div className="flex items-center gap-1 text-xs">
      <div>{emojis[badge]}</div>
      {showTitle && <div>{badgeNames[badge]}</div>}
    </div>
  );
}
