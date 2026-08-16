const POST_LOGIN_TOAST_KEY = "barbellist:post-login-toast";

export type PostLoginToastKind = "branch" | "signup-signin";

/** Queue a welcome toast that survives full-page navigation after login/signup. */
export function queuePostLoginToast(kind: PostLoginToastKind) {
  try {
    sessionStorage.setItem(POST_LOGIN_TOAST_KEY, kind);
  } catch {
    // sessionStorage unavailable (private mode quirks) — skip toast
  }
}

export function consumePostLoginToast(): PostLoginToastKind | null {
  try {
    const value = sessionStorage.getItem(POST_LOGIN_TOAST_KEY);
    sessionStorage.removeItem(POST_LOGIN_TOAST_KEY);
    if (value === "branch" || value === "signup-signin") {
      return value;
    }
  } catch {
    // ignore
  }
  return null;
}

export function postLoginToastCopy(kind: PostLoginToastKind): {
  title: string;
  message: string;
} {
  switch (kind) {
    case "signup-signin":
      return {
        title: "Account created",
        message: "Please sign in to continue.",
      };
    case "branch":
      return {
        title: "Welcome back",
        message: "Choose a branch to continue…",
      };
  }
}
