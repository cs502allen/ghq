export interface TimeControl {
  time: number;
  bonus: number;
  variant?: string;
}

export const rows = 8;
export const columns = 8;
export const MOVE_SPEED_MS = 250;
export const squareSizes = {
  small: 45,
  large: 75,
};
export const pieceSizes = {
  small: 30,
  large: 52,
};

export const TIME_CONTROLS: Record<string, TimeControl> = {
  rapid: { time: 15 * 60 * 1000, bonus: 10 * 1000 },
  blitz: { time: 3 * 60 * 1000, bonus: 6 * 1000 },
  correspondence: { time: 0, bonus: 0 },
  normandy: { time: 15 * 60 * 1000, bonus: 10 * 1000, variant: "normandy" },
};
