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
  metadataBase: new URL("https://barbellist.com"),
  title: {
    default: "Barbellist — Gym Management Software",
    template: "%s | Barbellist",
  },
  description:
    "The calm, all-in-one gym management platform for independent gyms. Members, fees, attendance, staff, expenses, and inventory — in one dashboard.",
  keywords: [
    "gym management software",
    "gym billing system",
    "gym attendance system",
    "gym member management",
    "fitness center software",
    "gym management app",
    "gym fee tracking",
    "gym management Pakistan",
    "gym software Saudi Arabia",
  ],
  authors: [{ name: "Barbellist" }],
  creator: "Barbellist",
  publisher: "Barbellist",
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://barbellist.com",
    siteName: "Barbellist",
    title: "Barbellist — Gym Management Software",
    description:
      "The calm, all-in-one gym management platform for independent gyms. Members, fees, attendance, staff, expenses, and inventory — in one dashboard.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Barbellist — Gym Management Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Barbellist — Gym Management Software",
    description:
      "The calm, all-in-one gym management platform for independent gyms.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B5E3C",
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
