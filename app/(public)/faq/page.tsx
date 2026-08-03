import type { Metadata } from "next";
import Link from "next/link";
import { FaqJsonLd } from "@/components/seo/json-ld";
import { FaqPageClient } from "@/components/landing/FaqPageClient";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "FAQ — Barbellist",
  description:
    "Frequently asked questions about Barbellist gym management software: pricing, hardware, data security, and canceling anytime.",
  alternates: {
    canonical: "https://barbellist.com/faq",
  },
};

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd />
      <div
        style={{
          minHeight: "100vh",
          background: "#FAF7F2",
          color: "#1F1F1F",
        }}
      >
        <header
          style={{
            borderBottom: "1px solid #E7E2D6",
            background: "rgba(250,247,242,.96)",
          }}
        >
          <div
            style={{
              maxWidth: 896,
              margin: "0 auto",
              padding: "0 24px",
              height: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Logo variant="lockup" height={30} href="/home" />
            <Link
              href="/home#pricing"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#1B5E3C",
                textDecoration: "none",
              }}
            >
              Pricing
            </Link>
          </div>
        </header>
        <FaqPageClient />
      </div>
    </>
  );
}
