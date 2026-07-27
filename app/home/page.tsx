import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: {
    absolute: "Barbellist — Gym Management Software for Independent Gyms",
  },
  description:
    "Stop managing spreadsheets. Start running your gym. Barbellist automates membership tracking, fee collection, attendance, staff management, and inventory for independent gyms worldwide. Free for 3 months.",
  alternates: {
    canonical: "https://barbellist.com/home",
  },
  openGraph: {
    title: "Barbellist — Gym Management Software for Independent Gyms",
    description:
      "Stop managing spreadsheets. Start running your gym. Barbellist automates membership tracking, fee collection, attendance, staff management, and inventory.",
    url: "https://barbellist.com/home",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Barbellist — Gym Management Dashboard",
      },
    ],
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <LandingPage />
    </>
  );
}
