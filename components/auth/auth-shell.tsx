"use client";

import type { ReactNode } from "react";
import { Paper, Stack, Text, Title } from "@mantine/core";
import { BarbellistLogo } from "@/components/brand/barbellist-logo";
import styles from "./auth-shell.module.css";

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
    <div className={`auth-shell ${styles.shell}`}>
      <div
        className={styles.bgWash}
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 18% 40%, rgba(27,94,60,0.95) 0%, transparent 60%), radial-gradient(ellipse 45% 35% at 88% 72%, rgba(201,134,27,0.16) 0%, transparent 55%)",
        }}
      />

      <aside className={`auth-brand-panel ${styles.brandPanel}`}>
        <Stack
          align="center"
          gap={20}
          className={`auth-fade-in ${styles.brandInner}`}
        >
          <BarbellistLogo
            layout="stacked"
            variant="light"
            markSize={96}
            wordmarkSize={56}
            gap={28}
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

      <main className={styles.formMain}>
        <Paper
          className={`auth-fade-in-delay ${styles.formPaper}`}
          radius={28}
          p={{ base: 28, sm: 40 }}
          style={{
            background: "#FFFFFF",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div className={styles.logoRow}>
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

          <div className={styles.footer}>{footer}</div>
        </Paper>
      </main>
    </div>
  );
}
