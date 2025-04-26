"use client";

import { UsersOnline } from "@/lib/types";

export default function Players({
  usersOnline,
}: {
  usersOnline: UsersOnline | null;
}) {
  if (!usersOnline) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col">
          <div>No users online</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-col">
        {usersOnline.users.map((user) => (
          <div key={user.id} className="rounded flex justify-between">
            <div>{user.username}</div>
            <div className="text-sm">{user.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
