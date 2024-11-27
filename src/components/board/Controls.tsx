import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export interface ControlsProps {
  undo: () => void;
  redo: () => void;
  cancel: () => void;
}

export default function useControls({ undo, redo, cancel }: ControlsProps) {
  useHotkeys(
    "escape",
    (e) => {
      e.preventDefault();
      cancel();
    },
    []
  );

  useHotkeys(
    "left",
    (e) => {
      e.preventDefault();
      undo();
    },
    []
  );

  useHotkeys(
    "right",
    (e) => {
      e.preventDefault();
      redo();
    },
    []
  );

  return {};
}
