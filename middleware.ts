import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Use middleware.ts (not proxy.ts) for Cloudflare Pages.
 * Next.js 16 proxy.ts is Node-only; @cloudflare/next-on-pages requires Edge.
 * middleware.ts still works (deprecated warning) and defaults to Edge.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and images.
     * Landing (/home), APIs, and auth pages are handled inside updateSession.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
