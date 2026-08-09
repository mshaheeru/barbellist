"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import {
  Anchor,
  Button,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  Building2,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signUpGym } from "@/app/actions/auth";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);

  const form = useForm<SignUpInput>({
    mode: "controlled",
    initialValues: {
      gymName: "",
      ownerName: "",
      email: "",
      password: "",
      phone: "",
      city: "",
      country: "PK",
    },
    validate: zod4Resolver(signUpSchema),
  });

  const onSubmit = form.onSubmit(async (values) => {
    setLoading(true);
    try {
      const result = await signUpGym(values);
      if (result.error) {
        notifications.show({
          color: "red",
          title: "Registration failed",
          message: result.error,
        });
        return;
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        notifications.show({
          color: "forest",
          title: "Account created",
          message: "Please sign in to continue.",
        });
        window.location.assign("/login");
        return;
      }

      // Full navigation after cookie/session changes — soft router.push +
      // refresh races middleware (auth pages redirect) and yields empty RSC `{}`.
      window.location.assign("/dashboard");
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthShell
      title="Create account"
      subtitle="Register your gym and start managing in minutes."
      footer={
        <Text size="sm" c="dimmed">
          Already have an account?{" "}
          <Anchor component={Link} href="/login" fw={600} c="forest.6">
            Sign in
          </Anchor>
        </Text>
      }
    >
      <form onSubmit={onSubmit}>
        <Stack gap="sm">
          <TextInput
            label="Gym name"
            placeholder="Iron Republic"
            required
            leftSection={<Building2 size={18} strokeWidth={1.6} />}
            leftSectionPointerEvents="none"
            {...form.getInputProps("gymName")}
          />
          <TextInput
            label="Your name"
            placeholder="Imran Sheikh"
            required
            leftSection={<User size={18} strokeWidth={1.6} />}
            leftSectionPointerEvents="none"
            {...form.getInputProps("ownerName")}
          />
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <TextInput
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="owner@gym.com"
              required
              leftSection={<Mail size={18} strokeWidth={1.6} />}
              leftSectionPointerEvents="none"
              {...form.getInputProps("email")}
            />
            <TextInput
              label="Phone"
              type="tel"
              placeholder="+92 300 1234567"
              required
              leftSection={<Phone size={18} strokeWidth={1.6} />}
              leftSectionPointerEvents="none"
              {...form.getInputProps("phone")}
            />
          </SimpleGrid>
          <PasswordInput
            label="Password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
            leftSection={<Lock size={18} strokeWidth={1.6} />}
            leftSectionPointerEvents="none"
            {...form.getInputProps("password")}
          />
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <TextInput
              label="City"
              placeholder="Karachi"
              required
              leftSection={<MapPin size={18} strokeWidth={1.6} />}
              leftSectionPointerEvents="none"
              {...form.getInputProps("city")}
            />
            <TextInput
              label="Country"
              placeholder="PK"
              required
              {...form.getInputProps("country")}
            />
          </SimpleGrid>
          <Button type="submit" fullWidth loading={loading} mt="md" size="md">
            Create gym account
          </Button>
        </Stack>
      </form>
    </AuthShell>
  );
}
