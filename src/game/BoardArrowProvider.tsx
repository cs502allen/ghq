"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface BoardArrowType {
  from: [number, number];
  to: [number, number];
}

interface BoardArrowContextType {
  boardArrows: BoardArrowType[];
  setBoardArrows: React.Dispatch<React.SetStateAction<BoardArrowType[]>>;
}

const BoardArrowContext = createContext<BoardArrowContextType | undefined>(
  undefined
);

export const useBoardArrow = () => {
  const context = useContext(BoardArrowContext);
  if (!context) {
    throw new Error("useBoardArrow must be used within a BoardArrowProvider");
  }
  return context;
};

export const BoardArrowProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [boardArrows, setBoardArrows] = useState<BoardArrowType[]>([]);

  return (
    <BoardArrowContext.Provider value={{ boardArrows, setBoardArrows }}>
      {children}
    </BoardArrowContext.Provider>
  );
};
