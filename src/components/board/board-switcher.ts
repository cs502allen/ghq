"use client";

declare global {
  interface Window {
    useBoardV1: () => void;
    useBoardV2: () => void;
  }
}

if (typeof window !== "undefined") {
  window.useBoardV1 = useBoardV1;
  window.useBoardV2 = useBoardV2;
}

export function shouldUseBoardV2(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return (localStorage.getItem("useBoardV2") ?? "true") === "true";
}

export function useBoardV2() {
  localStorage.setItem("useBoardV2", "true");
}

export function useBoardV1() {
  localStorage.setItem("useBoardV2", "false");
}
