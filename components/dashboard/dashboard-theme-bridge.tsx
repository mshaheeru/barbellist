"use client";

import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import { useGym } from "@/components/gym-provider";
import {
  parseGymTheme,
  resolveTheme,
  themeToCssVars,
} from "@/lib/theme/tokens";

type DashboardThemeBridgeProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Injects gym theme as CSS variables on the dashboard shell.
 * Avoids a nested MantineProvider so root Notifications keep working.
 */
export function DashboardThemeBridge({
  children,
  className,
}: DashboardThemeBridgeProps) {
  const { gym } = useGym();
  const lastCssVarsRef = useRef<CSSProperties | null>(null);

  const themeKey = useMemo(() => {
    const settings =
      gym?.settings &&
      typeof gym.settings === "object" &&
      !Array.isArray(gym.settings)
        ? (gym.settings as Record<string, unknown>)
        : {};
    const parsed = parseGymTheme(settings.theme);
    return parsed
      ? `${parsed.primary}:${parsed.accent ?? ""}`
      : "default";
  }, [gym?.settings]);

  const resolved = useMemo(() => {
    const settings =
      gym?.settings &&
      typeof gym.settings === "object" &&
      !Array.isArray(gym.settings)
        ? (gym.settings as Record<string, unknown>)
        : {};
    return resolveTheme(parseGymTheme(settings.theme));
    // themeKey captures settings.theme changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeKey, gym?.settings]);

  const cssVars = useMemo(() => {
    if (!gym) {
      return lastCssVarsRef.current ?? undefined;
    }
    const vars = themeToCssVars(resolved) as CSSProperties;
    lastCssVarsRef.current = vars;
    return vars;
  }, [gym, resolved]);

  useEffect(() => {
    if (!cssVars) return;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(cssVars)) {
      if (typeof value === "string") root.style.setProperty(key, value);
    }
  }, [cssVars]);

  return (
    <div className={className} style={cssVars}>
      {children}
    </div>
  );
}
