"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ghqFetch } from "@/lib/api";
import { API_URL } from "@/app/live/config";

interface MatchmakingContextType {
  isMatchmaking: boolean;
  startMatchmaking: () => void;
  cancelMatchmaking: () => void;
}

const MatchmakingContext = createContext<MatchmakingContextType | undefined>(
  undefined
);

export const useMatchmaking = () => {
  const context = useContext(MatchmakingContext);
  if (!context) {
    throw new Error("useMatchmaking must be used within a MatchmakingProvider");
  }
  return context;
};

interface MatchmakingData {
  match: {
    id: string;
    playerId: string;
    credentials: string;
  };
}

export const MatchmakingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();

  const checkMatchmaking = useCallback(async () => {
    try {
      const data = await ghqFetch<MatchmakingData>({
        url: `${API_URL}/matchmaking`,
        getToken,
        method: "POST",
      });
      if (data.match) {
        router.push(`/live/${data.match.id}`);
        setIsMatchmaking(false);
      }
    } catch (error) {
      console.error("Error polling matchmaking API:", error);
    }
  }, [router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMatchmaking) {
      checkMatchmaking();
      interval = setInterval(() => checkMatchmaking(), 2000); // Poll every 2 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMatchmaking, checkMatchmaking]);

  const startMatchmaking = () => {
    setIsMatchmaking(true);
  };

  const cancelMatchmaking = () => {
    setIsMatchmaking(false);
    ghqFetch({ url: `${API_URL}/matchmaking`, getToken, method: "DELETE" });
  };

  return (
    <MatchmakingContext.Provider
      value={{ isMatchmaking, startMatchmaking, cancelMatchmaking }}
    >
      {children}
    </MatchmakingContext.Provider>
  );
};
