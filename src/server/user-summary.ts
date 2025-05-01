import { UserBadge } from "@/lib/types";
import { SupabaseClient } from "@supabase/supabase-js";

export interface UserSummary {
  username: string;
  elo: number;
  gamesThisMonth: number;
  badge: UserBadge;
  created_at: string;
  matchHistory: {
    wins: number;
    losses: number;
    draws: number;
    total: number;
  };
}

export interface MatchHistory {
  wins: number;
  losses: number;
  draws: number;
  total: number;
}

export async function getUserSummary(
  supabase: SupabaseClient,
  userId: string
): Promise<UserSummary> {
  const { data, error } = await supabase
    .from("users")
    .select("username, created_at, elo, gamesThisMonth, badge")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("player0_id, player1_id, winner_id, status")
    .or(`player0_id.eq.${userId},player1_id.eq.${userId}`);

  if (matchesError) {
    throw new Error(matchesError.message);
  }

  const matchHistory = {
    wins: 0,
    losses: 0,
    draws: 0,
    total: matches.length,
  };

  for (const match of matches) {
    if (match.status === "DRAW") {
      matchHistory.draws++;
    } else if (match.winner_id === userId) {
      matchHistory.wins++;
    } else {
      matchHistory.losses++;
    }
  }

  return {
    ...data,
    matchHistory,
  };
}
