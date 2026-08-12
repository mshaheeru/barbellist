/**
 * Central Barbellist theme tokens.
 * Edit DEFAULT_THEME to change product defaults; gyms override via settings.theme.
 */

export const DEFAULT_THEME = {
  primary: "#1B5E3C",
  accent: "#C9861B",
  background: "#FAF7F2",
  foreground: "#1F1F1F",
  muted: "#E8E5DF",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  sidebar: "#123D28",
  sidebarActive: "#1B5E3C",
  sidebarMuted: "#A9C4B4",
  sidebarSubtle: "#88A596",
} as const;

export type DefaultTheme = typeof DEFAULT_THEME;

export type ResolvedTheme = {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  success: string;
  warning: string;
  danger: string;
  sidebar: string;
  sidebarActive: string;
  sidebarMuted: string;
  sidebarSubtle: string;
};

/** Persisted gym overrides under gyms.settings.theme */
export type GymThemeSettings = {
  primary: string;
  accent?: string;
};

export type MantineColorTuple = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_RE.test(value);
}

function normalizeHex(hex: string): string {
  return hex.toUpperCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

/** Mix color toward black (amount 0–1). */
export function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const t = 1 - amount;
  return rgbToHex(r * t, g * t, b * t);
}

/** Mix color toward white (amount 0–1). */
export function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  );
}

function deriveSidebarMuted(primary: string): string {
  return lighten(primary, 0.55);
}

function deriveSidebarSubtle(primary: string): string {
  return lighten(primary, 0.4);
}

/**
 * Merge gym overrides with DEFAULT_THEME.
 * When only primary is set, derive sidebar shades so one picker stays coherent.
 */
export function resolveTheme(
  overrides?: GymThemeSettings | null,
): ResolvedTheme {
  const primary =
    overrides?.primary && isHexColor(overrides.primary)
      ? normalizeHex(overrides.primary)
      : DEFAULT_THEME.primary;

  const accent =
    overrides?.accent && isHexColor(overrides.accent)
      ? normalizeHex(overrides.accent)
      : DEFAULT_THEME.accent;

  const usingDefaultPrimary =
    normalizeHex(primary) === normalizeHex(DEFAULT_THEME.primary);

  if (usingDefaultPrimary && (!overrides?.accent || normalizeHex(accent) === normalizeHex(DEFAULT_THEME.accent))) {
    return { ...DEFAULT_THEME };
  }

  if (usingDefaultPrimary) {
    return {
      ...DEFAULT_THEME,
      accent,
    };
  }

  return {
    ...DEFAULT_THEME,
    primary,
    accent,
    sidebar: darken(primary, 0.22),
    sidebarActive: primary,
    sidebarMuted: deriveSidebarMuted(primary),
    sidebarSubtle: deriveSidebarSubtle(primary),
  };
}

export function themeToCssVars(
  theme: ResolvedTheme,
): Record<string, string> {
  const forest = buildForestPalette(theme.primary);
  const vars: Record<string, string> = {
    "--color-primary": theme.primary,
    "--color-accent": theme.accent,
    "--color-background": theme.background,
    "--color-foreground": theme.foreground,
    "--color-muted": theme.muted,
    "--color-success": theme.success,
    "--color-warning": theme.warning,
    "--color-danger": theme.danger,
    "--color-sidebar": theme.sidebar,
    "--color-sidebar-active": theme.sidebarActive,
    "--color-sidebar-muted": theme.sidebarMuted,
    "--color-sidebar-subtle": theme.sidebarSubtle,
  };

  // Override Mantine forest palette on the dashboard shell (no nested provider).
  forest.forEach((hex, i) => {
    vars[`--mantine-color-forest-${i}`] = hex;
  });
  vars["--mantine-color-forest-filled"] = forest[6];
  vars["--mantine-color-forest-filled-hover"] = forest[7];
  vars["--mantine-color-forest-light"] = `color-mix(in srgb, ${forest[6]} 12%, transparent)`;
  vars["--mantine-color-forest-light-hover"] = `color-mix(in srgb, ${forest[6]} 18%, transparent)`;
  vars["--mantine-color-forest-light-color"] = forest[6];
  vars["--mantine-color-forest-outline"] = forest[6];
  vars["--mantine-color-forest-outline-hover"] = `color-mix(in srgb, ${forest[6]} 8%, transparent)`;

  return vars;
}

/** 10-shade Mantine palette centered on primary at shade 6. */
export function buildForestPalette(primary: string): MantineColorTuple {
  const p = isHexColor(primary) ? normalizeHex(primary) : DEFAULT_THEME.primary;
  return [
    lighten(p, 0.92),
    lighten(p, 0.78),
    lighten(p, 0.62),
    lighten(p, 0.45),
    lighten(p, 0.28),
    lighten(p, 0.12),
    p,
    darken(p, 0.12),
    darken(p, 0.22),
    darken(p, 0.35),
  ];
}

export function parseGymTheme(raw: unknown): GymThemeSettings | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (!isHexColor(o.primary)) return null;
  const result: GymThemeSettings = { primary: normalizeHex(o.primary) };
  if (isHexColor(o.accent)) {
    result.accent = normalizeHex(o.accent);
  }
  return result;
}

/** True when theme matches product defaults (no meaningful override). */
export function isDefaultTheme(settings: GymThemeSettings | null): boolean {
  if (!settings) return true;
  const primary = normalizeHex(settings.primary);
  if (primary !== normalizeHex(DEFAULT_THEME.primary)) return false;
  if (settings.accent && normalizeHex(settings.accent) !== normalizeHex(DEFAULT_THEME.accent)) {
    return false;
  }
  return true;
}
