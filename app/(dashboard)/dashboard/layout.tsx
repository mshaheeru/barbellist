import type { ReactNode } from "react";

/** Dashboard requires auth + Supabase — never statically prerender at build. */
export const dynamic = "force-dynamic";

export default function DashboardSegmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
