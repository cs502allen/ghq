import { gamesPlayedToBadge, User } from "../lib/types";

export function updateUserStats(user: User) {
  user.gamesThisMonth = user.gamesThisMonth ? user.gamesThisMonth + 1 : 1;
  user.badge = gamesPlayedToBadge(user.gamesThisMonth);
}
