import { User } from "../lib/types";
import UserBadgeTag from "./UserBadgeTag";
import UserMiniProfile from "./UserMiniProfile";

export default function Username({
  user,
  includeElo,
}: {
  user: User;
  includeElo?: boolean;
}) {
  const content = (
    <div className="flex gap-1 items-center">
      <div>{user.username}</div>
      <UserBadgeTag badge={user.badge} />
      {includeElo && <div className="text-xs">({user.elo})</div>}
    </div>
  );

  return <UserMiniProfile user={user}>{content}</UserMiniProfile>;
}
