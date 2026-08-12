import { createTheme, rem, type MantineThemeOverride } from "@mantine/core";
import { buildForestPalette, DEFAULT_THEME } from "@/lib/theme/tokens";

const sharedComponents: MantineThemeOverride["components"] = {
  TextInput: {
    defaultProps: {
      size: "md",
      radius: "md",
    },
    styles: {
      label: {
        fontWeight: 600,
        fontSize: rem(13),
        marginBottom: rem(6),
        color: "#1F1F1F",
      },
      input: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E4DFD4",
        fontSize: rem(15),
        minHeight: rem(48),
        transition: "border-color 150ms ease, box-shadow 150ms ease",
        "&:focus": {
          borderColor: "var(--color-primary, #1B5E3C)",
        },
        "&::placeholder": {
          color: "#A39E93",
        },
      },
      error: {
        fontSize: rem(12),
        fontWeight: 500,
      },
    },
  },
  PasswordInput: {
    defaultProps: {
      size: "md",
      radius: "md",
    },
    styles: {
      label: {
        fontWeight: 600,
        fontSize: rem(13),
        marginBottom: rem(6),
        color: "#1F1F1F",
      },
      input: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E4DFD4",
        fontSize: rem(15),
        minHeight: rem(48),
      },
      innerInput: {
        minHeight: rem(46),
        fontSize: rem(15),
      },
    },
  },
  Button: {
    defaultProps: {
      radius: "md",
      size: "md",
    },
    styles: {
      root: {
        fontWeight: 600,
        fontSize: rem(15),
        minHeight: rem(48),
      },
    },
  },
  Paper: {
    defaultProps: {
      radius: "lg",
    },
  },
};

const amberPalette = [
  "#FBF3E4",
  "#F5E2C0",
  "#E7B24E",
  "#D9A03A",
  "#C9861B",
  "#A86E14",
  "#8A5A10",
  "#6B450C",
  "#4D3108",
  "#2E1D05",
] as const;

function buildTheme(primary: string) {
  return createTheme({
    primaryColor: "forest",
    fontFamily: "var(--font-geist), system-ui, sans-serif",
    headings: {
      fontFamily:
        "var(--font-space-grotesk), var(--font-geist), system-ui, sans-serif",
      fontWeight: "700",
    },
    defaultRadius: "md",
    colors: {
      forest: buildForestPalette(primary),
      amber: [...amberPalette],
    },
    primaryShade: 6,
    components: sharedComponents,
  });
}

/** Barbellist Mantine theme — forest green primary, amber accent */
export const barbellistTheme = buildTheme(DEFAULT_THEME.primary);

/** Dashboard override — forest palette follows gym primary. */
export function createGymMantineTheme(primary: string) {
  return buildTheme(primary);
}
