"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { buildEnterUrl } from "@/lib/auth/post-login-enter";
import { queuePostLoginToast } from "@/lib/auth/post-login-toast";
import { primeIgnitionAudio } from "@/lib/brand/ignition-audio";
import {
  friendlySignUpError,
  signUpSchema,
  type SignUpInput,
} from "@/lib/validations/auth";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<SignUpInput>({
    mode: "controlled",
    validateInputOnBlur: true,
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

  const onSubmit = form.onSubmit(
    async (values) => {
      // Unlock Web Audio during the click gesture (before await).
      primeIgnitionAudio();
      setLoading(true);
      try {
        const result = await signUpGym(values);
        if (result.error) {
          notifications.show({
            color: "red",
            title: "Registration failed",
            message: friendlySignUpError(result.error),
          });
          return;
        }

        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (signInError) {
          queuePostLoginToast("signup-signin");
          window.location.assign("/login");
          return;
        }

        // Soft nav keeps the primed AudioContext alive for the ignition score.
        router.push(buildEnterUrl("/dashboard"));
      } catch (e) {
        notifications.show({
          color: "red",
          title: "Registration failed",
          message: friendlySignUpError(
            e instanceof Error ? e.message : "Something went wrong. Please try again.",
          ),
        });
      } finally {
        setLoading(false);
      }
    },
    (errors) => {
      const first = Object.values(errors).find(
        (v): v is string => typeof v === "string" && v.length > 0,
      );
      notifications.show({
        color: "red",
        title: "Check your details",
        message: first ?? "Please fix the highlighted fields and try again.",
      });
    },
  );

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
      <form onSubmit={onSubmit} noValidate>
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
            description="At least 8 characters"
            placeholder="Create a password"
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
