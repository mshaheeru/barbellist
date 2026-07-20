"use client";

import type { ReactNode } from "react";
import { Paper, Stack, Text, Title } from "@mantine/core";
import { BarbellistLogo } from "@/components/brand/barbellist-logo";

type AuthShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  footer: ReactNode;
};

export function AuthShell({
  children,
  title,
  subtitle,
  footer,
}: AuthShellProps) {
  return (
    <div className="auth-shell relative flex min-h-dvh overflow-hidden bg-[#123D28]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 18% 40%, rgba(27,94,60,0.95) 0%, transparent 60%), radial-gradient(ellipse 45% 35% at 88% 72%, rgba(201,134,27,0.16) 0%, transparent 55%)",
        }}
      />

      {/* LEFT — brand panel */}
      <aside className="auth-brand-panel relative z-10 w-1/2 flex-col items-center justify-center px-12 lg:flex xl:px-16">
        <Stack align="center" gap={20} className="auth-fade-in max-w-[520px]">
          <BarbellistLogo
            layout="stacked"
            variant="light"
            markSize={96}
            wordmarkSize={56}
            className="gap-7"
          />

          <Text
            className="auth-display-title auth-brand-tagline"
            ta="center"
            fw={600}
            style={{
              fontSize: "clamp(22px, 2.5vw, 26px)",
              color: "#C5D9CE",
              letterSpacing: "-0.01em",
            }}
          >
            Gym Management System
          </Text>
        </Stack>
      </aside>

      {/* RIGHT — form card */}
      <main className="relative z-10 flex w-full flex-1 items-center justify-center p-5 sm:p-8 lg:w-1/2 lg:p-12">
        <Paper
          className="auth-fade-in-delay w-full max-w-[460px]"
          radius={28}
          p={{ base: 28, sm: 40 }}
          style={{
            background: "#FFFFFF",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div className="mb-8 flex justify-center">
            <BarbellistLogo
              layout="horizontal"
              variant="dark"
              markSize={38}
              wordmarkSize={26}
            />
          </div>

          <Text size="xs" c="dimmed" ta="center" mb={20}>
            Gym Management System
          </Text>

          <Title
            order={2}
            className="auth-display-title"
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#1F1F1F",
            }}
          >
            {title}
          </Title>
          <Text size="sm" c="dimmed" mt={8} mb={28} lh={1.6}>
            {subtitle}
          </Text>

          {children}

          <div className="mt-8 text-center">{footer}</div>
        </Paper>
      </main>
    </div>
  );
}
