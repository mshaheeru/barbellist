"use client";

import { useGym } from "@/components/gym-provider";
import type { StaffRole } from "@/lib/types";
import * as permissions from "@/lib/auth/permissions";

export function useRole() {
  const { role, staffId, gymId, loading } = useGym();

  return {
    role,
    staffId,
    gymId,
    loading,
    isOwner: role === "owner",
    isManager: role === "manager",
    isCashier: role === "cashier",
    isTrainer: role === "trainer",
    isCleaner: role === "cleaner",
    can: permissions,
  };
}

export function useHasRole(allowed: StaffRole | StaffRole[]): boolean {
  const { role } = useRole();
  if (!role) return false;
  const list = Array.isArray(allowed) ? allowed : [allowed];
  return list.includes(role);
}
