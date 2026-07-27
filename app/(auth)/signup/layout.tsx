import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Start Free — Create Your Gym",
  description:
    "Create your Barbellist account. Free for 3 months, no credit card required. Set up your gym in under an hour.",
  robots: { index: true, follow: true },
};

export default function SignupLayout({ children }: { children: ReactNode }) {
  return children;
}
