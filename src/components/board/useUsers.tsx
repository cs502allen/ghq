import { GHQState } from "@/game/engine";
import { getUsers } from "@/lib/supabase";
import { User } from "@/lib/types";
import { useEffect, useState } from "react";

export function useUsers({ G }: { G: GHQState }) {
  const [users, setUsers] = useState<User[]>([]);
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

    getUsers(userIds).then((users) => {
      if (users) {
        setUsers(users);
      }
    });
  }, [userIds]);

  return { users };
}
