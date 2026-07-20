import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default function KioskRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
