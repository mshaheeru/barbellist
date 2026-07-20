"use client";

import type { ReactNode } from "react";
import type { StaffRole } from "@/lib/types";
import { useRole } from "@/hooks/use-role";

type RoleGateProps = {
  /** Roles allowed to see children */
  role?: StaffRole | StaffRole[];
  /** Alias for `role` — Prompt 14 naming */
  allow?: StaffRole | StaffRole[];
  fallback?: ReactNode;
  children: ReactNode;
};

/**
 * Conditionally render UI by staff role.
 * Prefer server-side redirects for whole pages; use RoleGate for buttons/sections.
 */
export function RoleGate({
  role,
  allow,
  fallback = null,
  children,
}: RoleGateProps) {
  const { role: current } = useRole();
  const allowed = allow ?? role;
  if (!allowed) return <>{children}</>;
  if (!current) return <>{fallback}</>;

  const list = Array.isArray(allowed) ? allowed : [allowed];
  if (!list.includes(current)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
