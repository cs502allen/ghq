import { clerkMiddleware } from "@clerk/nextjs/server";
import { config as appConfig } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";

function defaultMiddleware(request: NextRequest) {
  return NextResponse.next();
}

export default appConfig.useClerk ? clerkMiddleware() : defaultMiddleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
