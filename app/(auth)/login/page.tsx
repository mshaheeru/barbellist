"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import {
  Anchor,
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { resolvePostLoginDestination } from "@/lib/auth/branches";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginInput>({
    mode: "controlled",
    initialValues: { email: "", password: "" },
    validate: zodResolver(loginSchema),
  });

  const onSubmit = form.onSubmit(async (values) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        notifications.show({
          color: "red",
          title: "Sign in failed",
          message: error.message,
        });
        return;
      }

      const dest = await resolvePostLoginDestination();
      if (dest.destination === "/login") {
        notifications.show({
          color: "red",
          title: "Sign in failed",
          message: dest.error,
        });
        await supabase.auth.signOut();
        return;
      }

      // Refresh so JWT picks up any app_metadata updates
      await supabase.auth.refreshSession();

      notifications.show({
        color: "forest",
        title: "Welcome back",
        message:
          dest.destination === "/select-branch"
            ? "Choose a branch to continue…"
            : "Opening your dashboard…",
      });
      router.push(dest.destination);
      router.refresh();
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthShell
      title="Sign in"
      subtitle="Sign in to your account to continue."
      footer={
        <Text size="sm" c="dimmed">
          Don&apos;t have an account?{" "}
          <Anchor component={Link} href="/signup" fw={600} c="forest.6">
            Sign up
          </Anchor>
        </Text>
      }
    >
      <form onSubmit={onSubmit}>
        <Stack gap="md">
          <TextInput
            label="Email"
            placeholder="owner@gym.com"
            type="email"
            autoComplete="email"
            required
            leftSection={<Mail size={18} strokeWidth={1.6} />}
            leftSectionPointerEvents="none"
            {...form.getInputProps("email")}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            autoComplete="current-password"
            required
            leftSection={<Lock size={18} strokeWidth={1.6} />}
            leftSectionPointerEvents="none"
            {...form.getInputProps("password")}
          />
          <Button type="submit" fullWidth loading={loading} mt="sm" size="md">
            Sign in
          </Button>
        </Stack>
      </form>
    </AuthShell>
  );
}
