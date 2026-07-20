"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { barbellistTheme } from "@/lib/mantine/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={barbellistTheme} defaultColorScheme="light">
      <Notifications position="top-right" zIndex={4000} />
      {children}
    </MantineProvider>
  );
}
