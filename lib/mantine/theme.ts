import { createTheme, rem } from "@mantine/core";

/** Barbellist Mantine theme — forest green primary, amber accent */
export const barbellistTheme = createTheme({
  primaryColor: "forest",
  fontFamily: "var(--font-geist), system-ui, sans-serif",
  headings: {
    fontFamily: "var(--font-space-grotesk), var(--font-geist), system-ui, sans-serif",
    fontWeight: "700",
  },
  defaultRadius: "md",
  colors: {
    forest: [
      "#E7F0EA",
      "#C8DDD1",
      "#A9C4B4",
      "#88A596",
      "#5F8A72",
      "#3D7355",
      "#1B5E3C",
      "#174B31",
      "#123D28",
      "#0C2A1C",
    ],
    amber: [
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
    ],
  },
  primaryShade: 6,
  components: {
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
            borderColor: "#1B5E3C",
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
  },
});
