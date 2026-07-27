import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
