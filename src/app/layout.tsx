import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { BoardArrowProvider } from "@/game/BoardArrowProvider";
import { MatchmakingProvider } from "@/components/MatchmakingProvider";
import MatchmakingToast from "@/components/MatchmakingToast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "GHQ",
  description: "Play General Headquarters",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      dynamic
      signUpFallbackRedirectUrl={"/"}
      signInFallbackRedirectUrl={"/"}
    >
      <MatchmakingProvider>
        <BoardArrowProvider>
          <html lang="en">
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
              {children}
              <Toaster />
              <MatchmakingToast />
            </body>
          </html>
        </BoardArrowProvider>
      </MatchmakingProvider>
    </ClerkProvider>
  );
}
