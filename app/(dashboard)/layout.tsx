import type { ReactNode } from "react";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
