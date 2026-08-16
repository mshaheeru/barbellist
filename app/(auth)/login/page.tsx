"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
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
import { getUserGymId, getUserRole } from "@/lib/auth/claims";
import { queuePostLoginToast } from "@/lib/auth/post-login-toast";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginInput>({
    mode: "controlled",
    validateInputOnBlur: true,
    initialValues: { email: "", password: "" },
    validate: zod4Resolver(loginSchema),
  });

  const onSubmit = form.onSubmit(
    async (values) => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
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

        // Prefer claims already on the session — avoid a Server Action here.
        // Post-login Server Actions often fail on Workers before cookies settle,
        // which left users stuck on /login until a full refresh.
        const user = data.user;
        const role = getUserRole(user);
        const gymId = getUserGymId(user);
        const destination =
          role === "owner" && !gymId ? "/select-branch" : "/dashboard";

        // Only queue a toast when the next page still needs context.
        // "Opening your dashboard…" would otherwise appear after /dashboard is already open.
        if (destination === "/select-branch") {
          queuePostLoginToast("branch");
        }
        window.location.assign(destination);
      } catch (e) {
        notifications.show({
          color: "red",
          title: "Sign in failed",
          message:
            e instanceof Error ? e.message : "Something went wrong. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    },
    (errors) => {
      const first = Object.values(errors).find(
        (v): v is string => typeof v === "string" && v.length > 0,
      );
      if (first) {
        notifications.show({
          color: "red",
          title: "Check your details",
          message: first,
        });
      }
    },
  );

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
