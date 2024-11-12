"use client";

import { ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import Image from "next/image";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function Header() {
  return (
    <div className="flex justify-between">
      <a
        className="text-4xl font-bold text-blue-400 flex gap-2 items-center"
        href="/"
      >
        <Image
          src="/icon.png"
          alt="GHQ"
          width={40}
          height={40}
          className="cursor-pointer"
        />
        <Image src="/ghq-letters.png" alt="GHQ" width={120} height={32} />
      </a>
      <div className="p-2">
        <ClerkLoading>
          <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
        </ClerkLoading>
        <ClerkLoaded>
          <SignedOut>
            <SignInButton mode="modal">
              <div
                id="sign-in-button"
                className="bg-blue-800 hover:bg-blue-900 text-sm font-bold text-white rounded px-2 py-1 cursor-pointer"
              >
                Sign in
              </div>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </ClerkLoaded>
      </div>
    </div>
  );
}
