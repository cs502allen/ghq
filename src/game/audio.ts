function playSound(filename: string, volume: number) {
  if (typeof window !== "undefined") {
    const audio = new Audio(filename);
    audio.volume = volume;
    audio.play().catch(() => {});
  }
}

function playSoundRateLimited(fileName: string, volume = 0.2) {
  let lastPlayed = 0;
  return () => {
    if (Date.now() - lastPlayed > 100) {
      playSound(fileName, volume);
      lastPlayed = Date.now();
    }
  };
}

export const playMoveSound = playSoundRateLimited("/move-piece.mp3");
export const playCaptureSound = playSoundRateLimited("/capture-piece.mp3");
export const playNextTurnSound = playSoundRateLimited("/swoosh.mp3", 0.15);
export const playGameReadySound = playSoundRateLimited(
  "/cold-wind-blowing.mp3",
  1
);
