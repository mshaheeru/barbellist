import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: {
    absolute: "Barbellist | Gym Revenue Recovery System",
  },
  description:
    "More revenue. Fewer cancellations. Less admin. Barbellist finds overdue fees, at-risk members, and missed renewals, then helps you recover them. Free revenue audit. First 30 days free.",
  alternates: {
    canonical: "https://barbellist.com/home",
  },
  openGraph: {
    title: "Barbellist | Gym Revenue Recovery System",
    description:
      "More revenue. Fewer cancellations. Less admin. Free revenue audit. First 30 days free for founding gyms.",
    url: "https://barbellist.com/home",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Barbellist | Gym Revenue Recovery System",
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
