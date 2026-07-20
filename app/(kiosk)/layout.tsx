"use client";

import { useEffect } from "react";
import { GymProvider } from "@/components/gym-provider";

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  return <GymProvider>{children}</GymProvider>;
}
