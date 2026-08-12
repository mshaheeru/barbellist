"use client";

import { useEffect } from "react";
import { notifications } from "@mantine/notifications";
import {
  consumePostLoginToast,
  postLoginToastCopy,
} from "@/lib/auth/post-login-toast";

/** Shows the post-login/signup welcome toast after full-page navigation. */
export function PostLoginToast() {
  useEffect(() => {
    const kind = consumePostLoginToast();
    if (!kind) return;
    const { title, message } = postLoginToastCopy(kind);
    notifications.show({
      color: "forest",
      title,
      message,
    });
  }, []);

  return null;
}
