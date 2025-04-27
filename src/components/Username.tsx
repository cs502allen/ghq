import { User } from "../lib/types";
import UserBadgeTag from "./UserBadgeTag";

export default function Username({
  user,
  includeElo,
}: {
  user: User;
  includeElo?: boolean;
}) {
  return (
    <div className="flex gap-1 items-center">
      <div>{user.username}</div>
      <UserBadgeTag badge={user.badge} />
      {includeElo && <div className="text-xs">({user.elo})</div>}
    </div>
  );
}
