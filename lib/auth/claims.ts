import type { User } from "@supabase/supabase-js";
import type { StaffRole } from "@/lib/types";

/** Trusted claims live in app_metadata; user_metadata is fallback during migration. */
export function getAuthClaim(
  user: User | null | undefined,
  key: string,
): string | undefined {
  if (!user) return undefined;
  const fromApp = user.app_metadata?.[key];
  if (typeof fromApp === "string" && fromApp) return fromApp;
  const fromUser = user.user_metadata?.[key];
  if (typeof fromUser === "string" && fromUser) return fromUser;
  return undefined;
}

export function getUserGymId(user: User | null | undefined): string | undefined {
  return getAuthClaim(user, "gym_id");
}

export function getUserOrganizationId(
  user: User | null | undefined,
): string | undefined {
  return getAuthClaim(user, "organization_id");
}

export function getUserRole(
  user: User | null | undefined,
): StaffRole | null {
  const role = getAuthClaim(user, "role");
  return (role as StaffRole | undefined) ?? null;
}

export function getUserDisplayName(
  user: User | null | undefined,
): string | undefined {
  if (!user) return undefined;
  const name = user.user_metadata?.name;
  if (typeof name === "string" && name) return name;
  return undefined;
}
