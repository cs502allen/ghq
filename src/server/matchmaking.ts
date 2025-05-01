export const blitzQueue: Map<string, number> = new Map();
export const rapidQueue: Map<string, number> = new Map();
export const endgameQueue: Map<string, number> = new Map();
export const normandyQueue: Map<string, number> = new Map();
export const inGameUsers: Map<string, number> = new Map();

export function getQueue(mode: string) {
  if (mode === "blitz") {
    return blitzQueue;
  } else if (mode === "endgame") {
    return endgameQueue;
  } else if (mode === "normandy") {
    return normandyQueue;
  } else {
    return rapidQueue;
  }
}
