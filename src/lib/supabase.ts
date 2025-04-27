import { createClient } from "@supabase/supabase-js";
import { User } from "./types";

export const supabase = createClient(
  "https://wjucmtrnmjcaatbtktxo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqdWNtdHJubWpjYWF0YnRrdHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3MjIxMjMsImV4cCI6MjA0NjI5ODEyM30.QCUf0-2haXEidfeHYLfryqNk6ABtZXs5ItYZCv2yFOs"
);

export async function getUsernames(userIds: string[]): Promise<string[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, username")
    .in("id", userIds);

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  }

  const userIdsToUsernames: Record<string, string> = {};
  for (const { id, username } of data) {
    userIdsToUsernames[id] = username;
  }

  return userIds.map((userId) => userIdsToUsernames[userId] ?? "Anonymous");
}

export async function getUser(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, elo, gamesThisMonth, badge")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("User not found");
  }

  return {
    id: data.id,
    username: data.username,
    elo: data.elo,
    gamesThisMonth: data.gamesThisMonth,
    badge: data.badge,
  };
}
