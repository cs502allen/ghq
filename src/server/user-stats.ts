import { User } from "../lib/types";

export function updateUserStats(user: User) {
  user.gamesThisMonth = user.gamesThisMonth ? user.gamesThisMonth + 1 : 1;

  if (user.gamesThisMonth > 0) {
    user.badge = "recruit";
  } else if (user.gamesThisMonth > 3) {
    user.badge = "sergeant";
  } else if (user.gamesThisMonth > 5) {
    user.badge = "lieutenant";
  } else if (user.gamesThisMonth > 10) {
    user.badge = "captain";
  } else if (user.gamesThisMonth > 20) {
    user.badge = "commander";
  }
}
