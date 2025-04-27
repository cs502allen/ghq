export interface MatchModel {
  id: string;
  winner: string;
  player1: string;
  player1Elo: number;
  player2: string;
  player2Elo: number;
  status: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  elo: number;
  gamesThisMonth?: number;
  badge?: UserBadge;
}

export type UserBadge =
  | "recruit"
  | "sergeant"
  | "lieutenant"
  | "captain"
  | "commander"
  | "tralfamadorian";

export interface OnlineUser extends User {
  status:
    | "in blitz queue"
    | "in rapid queue"
    | "online"
    | "offline"
    | "in game";
}

export interface UsersOnline {
  users: OnlineUser[];
}
