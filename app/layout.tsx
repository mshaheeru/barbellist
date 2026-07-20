import type { Metadata, Viewport } from "next";
import { Geist, Space_Grotesk } from "next/font/google";
import {
  ColorSchemeScript,
  mantineHtmlProps,
} from "@mantine/core";
import { Providers } from "@/components/providers";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-geist",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Barbellist",
  description:
    "The calm, all-in-one gym management platform for independent gyms worldwide.",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body
        className={`${geist.variable} ${spaceGrotesk.variable} ${geist.className}`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
