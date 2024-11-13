function playSound(filename: string) {
  if (typeof window !== "undefined") {
    const audio = new Audio(filename);
    audio.volume = 0.2;
    audio.play().catch(() => {});
  }
}

function playSoundRateLimited(fileName: string) {
  let lastPlayed = 0;
  return () => {
    if (Date.now() - lastPlayed > 100) {
      playSound(fileName);
      lastPlayed = Date.now();
    }
  };
}

export const playMoveSound = playSoundRateLimited("/move-piece.mp3");
export const playCaptureSound = playSoundRateLimited("/capture-piece.mp3");
