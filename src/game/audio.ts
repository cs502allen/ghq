function getAudioElement(audio: string): HTMLAudioElement | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return {
    move: new Audio("/move-piece.mp3"),
    capture: new Audio("/capture-piece.mp3"),
    nextTurn: new Audio("/swoosh.mp3"),
    gameReady: new Audio("/cold-wind-blowing.mp3"),
  }[audio];
}

function playSound(audioName: string, volume: number) {
  const audio = getAudioElement(audioName);
  if (!audio) {
    return;
  }

  // If the audio is already playing, don't play it again within 50ms.
  if (audio.currentTime > 0 && audio.currentTime < 0.05) {
    return;
  }

  audio.volume = volume;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

export const playMoveSound = () => playSound("move", 0.2);
export const playCaptureSound = () => playSound("capture", 0.2);
export const playNextTurnSound = () => playSound("nextTurn", 0.15);
export const playGameReadySound = () => playSound("gameReady", 1);
