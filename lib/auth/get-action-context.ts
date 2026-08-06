import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { StaffRole } from "@/lib/types";
import {
  getUserGymId,
  getUserOrganizationId,
  getUserRole,
} from "@/lib/auth/claims";

export type ActionContext = {
  supabase: SupabaseClient;
  gymId: string;
  organizationId: string | null;
  userId: string;
  role: StaffRole | null;
  staffId: string | null;
};

export type GetActionContextOptions = {
  /** Require role in auth metadata (default false). */
  requireRole?: boolean;
  /** Fetch staff row; if true, staffId is required. */
  requireStaff?: boolean;
  /** Fetch staff row without requiring it (ignored if requireStaff). */
  includeStaff?: boolean;
  /** Require role === "owner" (default false). Implies includeStaff. */
  requireOwner?: boolean;
};

/**
 * Shared auth context for server actions.
 * Always returns a single supabase client so callers avoid a second createClient().
 * Staff lookup is always scoped by gym_id when performed.
 */
export async function getActionContext(
  opts: GetActionContextOptions = {},
): Promise<ActionContext | null> {
  const {
    requireRole = false,
    requireStaff = false,
    includeStaff = false,
    requireOwner = false,
  } = opts;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const gymId = getUserGymId(user);
  if (!gymId) return null;

  let organizationId = getUserOrganizationId(user) ?? null;
  const role = getUserRole(user);

  if (requireRole && !role) return null;
  if (requireOwner && role !== "owner") return null;

  let staffId: string | null = null;
  const shouldLoadStaff = requireStaff || includeStaff || requireOwner;

  if (shouldLoadStaff || !organizationId) {
    if (!organizationId) {
      const { data: gymRow } = await supabase
        .from("gyms")
        .select("organization_id")
        .eq("id", gymId)
        .maybeSingle();
      organizationId = gymRow?.organization_id ?? null;
    }
  }

  if (shouldLoadStaff) {
    const { data: staffRow } = await supabase
      .from("staff")
      .select("id")
      .eq("gym_id", gymId)
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (requireStaff && !staffRow) return null;
    staffId = staffRow?.id ?? null;
  }

  return {
    supabase,
    gymId,
    organizationId,
    userId: user.id,
    role,
    staffId,
  };
}

/** Gym + role required; staff not loaded (packages, settings, dashboard-style). */
export async function getActionContextWithRole(): Promise<
  (ActionContext & { role: StaffRole }) | null
> {
  const ctx = await getActionContext({ requireRole: true });
  if (!ctx || !ctx.role) return null;
  return { ...ctx, role: ctx.role };
}

/** Gym + role + staff row required (expenses, inventory, staff mutations). */
export async function getActionContextWithStaff(): Promise<
  (ActionContext & { role: StaffRole; staffId: string }) | null
> {
  const ctx = await getActionContext({ requireRole: true, requireStaff: true });
  if (!ctx || !ctx.role || !ctx.staffId) return null;
  return { ...ctx, role: ctx.role, staffId: ctx.staffId };
}
