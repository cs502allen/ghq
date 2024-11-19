import type { Game } from "boardgame.io";
import { GHQGame, GHQState } from "./engine";

export function newBotGame(): Game<GHQState> {
  const game = { ...GHQGame };

  const oldSetup = game.setup;
  game.setup = ({ ctx, ...plugins }, setupData): GHQState => {
    if (!oldSetup) throw new Error("No setup function found");
    const state = oldSetup({ ctx, ...plugins }, setupData);
    state.isOnline = true;
    state.timeControl = 100 * 60 * 1000;
    return state;
  };

  return game;
}
