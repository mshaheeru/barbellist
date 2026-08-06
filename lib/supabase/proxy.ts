import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function claim(
  user: {
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
  },
  key: string,
): string | undefined {
  const fromApp = user.app_metadata?.[key];
  if (typeof fromApp === "string" && fromApp) return fromApp;
  const fromUser = user.user_metadata?.[key];
  if (typeof fromUser === "string" && fromUser) return fromUser;
  return undefined;
}

/** Refresh Supabase session and enforce auth route guards (used by root proxy.ts). */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isDashboard = pathname.startsWith("/dashboard");
  const isSelectBranch = pathname === "/select-branch";
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if ((isDashboard || isSelectBranch) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const gymId = claim(user, "gym_id");
    const role = claim(user, "role");
    const url = request.nextUrl.clone();
    url.pathname =
      role === "owner" && !gymId ? "/select-branch" : "/dashboard";
    return NextResponse.redirect(url);
  }

  // Owners without an active branch must pick one before dashboard
  if (user && isDashboard) {
    const gymId = claim(user, "gym_id");
    const role = claim(user, "role");
    if (role === "owner" && !gymId) {
      const url = request.nextUrl.clone();
      url.pathname = "/select-branch";
      return NextResponse.redirect(url);
    }
  }

  // Non-owners shouldn't linger on select-branch
  if (user && isSelectBranch) {
    const role = claim(user, "role");
    if (role && role !== "owner") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
