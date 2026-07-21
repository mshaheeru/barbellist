import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/** Session refresh for protected routes (runs on Cloudflare Workers via OpenNext). */
export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  if (url.hostname === "www.barbellist.com") {
    url.hostname = "barbellist.com";
    return NextResponse.redirect(url, 301);
  }

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
