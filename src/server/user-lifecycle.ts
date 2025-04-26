import { OnlineUser, UsersOnline } from "@/lib/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { StorageAPI } from "boardgame.io";
import { blitzQueue, inGameUsers, rapidQueue } from "./matchmaking";

const ONLINE_USER_STALE_MS = 10_000;

const usersOnline: Map<string, number> = new Map();

let usersOnlineResponse: UsersOnline = {
  users: [],
};

export function getUsersOnlineResponse(): UsersOnline {
  return usersOnlineResponse;
}

export async function userLifecycle({
  db,
  supabase,
}: {
  db: StorageAPI.Async | StorageAPI.Sync;
  supabase: SupabaseClient;
}) {
  // Remove stale users from the online users list
  for (const [userId, lastActive] of usersOnline.entries()) {
    if (lastActive < Date.now() - ONLINE_USER_STALE_MS) {
      console.log(`Removing stale user from online users`, userId);
      usersOnline.delete(userId);
    }
  }

  const res: UsersOnline = {
    users: [],
  };

  const allUserIds = [];
  for (const userId of blitzQueue.keys()) {
    allUserIds.push(userId);
  }
  for (const userId of rapidQueue.keys()) {
    allUserIds.push(userId);
  }
  for (const userId of usersOnline.keys()) {
    allUserIds.push(userId);
  }

  const { data: users, error } = await supabase
    .from("users")
    .select("id, username, elo")
    .in("id", allUserIds);

  if (error) {
    console.log({
      message: "Error fetching users",
      error,
    });
    return;
  }

  for (const user of users) {
    let status: OnlineUser["status"] = "online";
    if (isActiveInQueue(user.id, blitzQueue)) {
      status = "in blitz queue";
    } else if (isActiveInQueue(user.id, rapidQueue)) {
      status = "in rapid queue";
    } else if (isActiveInGame(user.id)) {
      status = "in game";
    }

    res.users.push({
      id: user.id,
      username: user.username,
      elo: user.elo,
      status,
    });
  }

  // Sort users with "online" status at the top
  res.users.sort((a, b) => {
    if (a.status === "online" && b.status !== "online") {
      return -1;
    }
    if (a.status !== "online" && b.status === "online") {
      return 1;
    }
    return 0;
  });

  usersOnlineResponse = res;
}

export function addUserToOnlineUsers(userId: string) {
  usersOnline.set(userId, Date.now());
}

function isActiveInQueue(userId: string, queue: Map<string, number>): boolean {
  const lastActive = queue.get(userId);
  if (!lastActive) {
    return false;
  }

  return lastActive > Date.now() - 5_000;
}

function isActiveInGame(userId: string): boolean {
  const lastActive = inGameUsers.get(userId);
  if (!lastActive) {
    return false;
  }
  return lastActive > Date.now() - 10_000;
}
