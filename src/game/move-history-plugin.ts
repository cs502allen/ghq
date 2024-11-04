import { Plugin } from "boardgame.io";
import { GameMethod } from "boardgame.io/core";

export interface HistoryState {
  log: HistoryItem[];
}

export interface HistoryItem {
  message: string;
}

export const HistoryPlugin: Plugin = {
  name: "history",

  // Initialize the plugin's data.
  // This is stored in a special area of the state object
  // and not exposed to the move functions.
  setup: ({ G, ctx, game }): HistoryState => ({ log: [] }),

  // Create an object that becomes available in `ctx`
  // under `ctx['plugin-name']`.
  // This is called at the beginning of a move or event.
  // This object will be held in memory until flush (below)
  // is called.
  api: ({ G, ctx, game, data, playerID }) => {
    return data;
  },

  // Return an updated version of data that is persisted
  // in the game's state object.
  flush: ({ G, ctx, game, data, api }) => {
    return data;
  },

  // Function that accepts a move / trigger function
  // and returns another function that wraps it. This
  // wrapper can modify G before passing it down to
  // the wrapped function. It is a good practice to
  // undo the change at the end of the call.
  // `fnType` gives the type of hook being wrapped
  // and will be one of the `GameMethod` values —
  // import { GameMethod } from 'boardgame.io/core'
  fnWrap:
    (fn, fnType) =>
    ({ G, ...rest }, ...args) => {
      G = fn({ G, ...rest }, ...args);

      if (fnType === GameMethod.MOVE) {
        // console.log(fnType);
        // console.log(rest);
        // console.log(args);
      }
      return G;
    },

  //   // Function that allows the plugin to indicate that it
  //   // should not be run on the client. If it returns true,
  //   // the client will discard the state update and wait
  //   // for the master instead.
  //   noClient: ({ G, ctx, game, data, api }) => boolean,

  //   // Function that allows the plugin to indicate that the
  //   // current action should be declared invalid and cancelled.
  //   // If `isInvalid` returns an error message, the whole update
  //   // will be abandoned and an error returned to the client.
  //   isInvalid: ({ G, ctx, game, data, api }) => false | string,

  //   // Function that can filter `data` to hide secret state
  //   // before sending it to a specific client.
  //   // `playerID` could also be null or undefined for spectators.
  //   playerView: ({ G, ctx, game, data, playerID }) => filtered data object,
};

export function appendHistory(
  plugins: { [x: string]: unknown },
  log: HistoryItem
) {
  const history = plugins.history as HistoryState;
  if (!history) {
    return;
  }

  history.log.push(log);
}
