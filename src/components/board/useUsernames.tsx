import { GHQState } from "@/game/engine";
import { getUsernames } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function useUsernames({ G }: { G: GHQState }) {
  const [usernames, setUsernames] = useState<string[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);

  useEffect(() => {
    const newUserIds = [G.userIds["0"], G.userIds["1"]];
    if (newUserIds[0] === null || newUserIds[1] === null) {
      return;
    }

    if (
      userIds.length === 2 &&
      newUserIds[0] === userIds[0] &&
      newUserIds[1] === userIds[1]
    ) {
      return;
    }

    setUserIds(newUserIds);
  }, [G.userIds]);

  useEffect(() => {
    if (userIds.length !== 2) {
      return;
    }

    getUsernames(userIds).then((usernames) => {
      if (usernames) {
        setUsernames(usernames);
      }
    });
  }, [userIds]);

  return { usernames };
}
