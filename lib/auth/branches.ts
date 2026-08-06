"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BranchSummary } from "@/lib/types";
import {
  getUserGymId,
  getUserOrganizationId,
  getUserRole,
} from "@/lib/auth/claims";

export type ResolvePostLoginResult =
  | { destination: "/dashboard" }
  | { destination: "/select-branch"; branches: BranchSummary[] }
  | { destination: "/login"; error: string };

/**
 * After login, resolve whether the user goes to dashboard or branch picker.
 * Ensures app_metadata.gym_id is set for single-branch users.
 */
export async function resolvePostLoginDestination(): Promise<ResolvePostLoginResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { destination: "/login", error: "Not authenticated" };

  const role = getUserRole(user);
  const currentGymId = getUserGymId(user);
  let organizationId = getUserOrganizationId(user);

  // Owners: list branches via org membership
  if (role === "owner" || (!role && !currentGymId)) {
    const { data: memberships } = await supabase
      .from("organization_members")
      .select("organization_id, role")
      .eq("auth_user_id", user.id);

    if (memberships && memberships.length > 0) {
      organizationId = organizationId ?? memberships[0].organization_id;
      const orgIds = memberships.map((m) => m.organization_id);

      const { data: gyms } = await supabase
        .from("gyms")
        .select("id, name, slug, city, address")
        .in("organization_id", orgIds)
        .order("created_at", { ascending: true });

      const branches = (gyms ?? []) as BranchSummary[];

      if (branches.length === 0) {
        return { destination: "/login", error: "No branches found for your account" };
      }

      if (branches.length === 1) {
        const branch = branches[0];
        if (
          currentGymId !== branch.id ||
          getUserOrganizationId(user) !== organizationId
        ) {
          await setActiveBranchMetadata(
            user.id,
            branch.id,
            organizationId!,
            "owner",
          );
        }
        return { destination: "/dashboard" };
      }

      // Multiple branches — always ask which branch on login
      return { destination: "/select-branch", branches };
    }
  }

  // Non-owners (or owners without org membership row): staff binding
  const { data: staffRows } = await supabase
    .from("staff")
    .select("id, gym_id, role, name")
    .eq("auth_user_id", user.id)
    .eq("status", "active");

  if (!staffRows || staffRows.length === 0) {
    return { destination: "/login", error: "No staff access found for this account" };
  }

  // Prefer non-owner single gym; owners with multi staff go through picker
  const ownerRows = staffRows.filter((s) => s.role === "owner");
  if (ownerRows.length > 1) {
    const gymIds = ownerRows.map((s) => s.gym_id);
    const { data: gyms } = await supabase
      .from("gyms")
      .select("id, name, slug, city, address, organization_id")
      .in("id", gymIds)
      .order("created_at", { ascending: true });

    const branches = (gyms ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      city: g.city,
      address: g.address,
    })) as BranchSummary[];

    if (currentGymId && branches.some((b) => b.id === currentGymId)) {
      return { destination: "/dashboard" };
    }
    return { destination: "/select-branch", branches };
  }

  const staff = staffRows[0];
  const { data: gym } = await supabase
    .from("gyms")
    .select("id, organization_id")
    .eq("id", staff.gym_id)
    .maybeSingle();

  if (!gym) {
    return { destination: "/login", error: "Branch not found" };
  }

  if (
    currentGymId !== gym.id ||
    getUserRole(user) !== staff.role ||
    getUserOrganizationId(user) !== gym.organization_id
  ) {
    await setActiveBranchMetadata(
      user.id,
      gym.id,
      gym.organization_id,
      staff.role,
    );
  }

  return { destination: "/dashboard" };
}

export async function listOwnerBranches(): Promise<{
  data: BranchSummary[] | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("auth_user_id", user.id)
    .eq("role", "owner");

  if (!memberships || memberships.length === 0) {
    return { data: null, error: "Only owners can list branches" };
  }

  const { data: gyms, error } = await supabase
    .from("gyms")
    .select("id, name, slug, city, address")
    .in(
      "organization_id",
      memberships.map((m) => m.organization_id),
    )
    .order("created_at", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: (gyms ?? []) as BranchSummary[], error: null };
}

export async function selectBranch(
  gymId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = createAdminClient();

  const { data: gym } = await admin
    .from("gyms")
    .select("id, organization_id, name")
    .eq("id", gymId)
    .maybeSingle();

  if (!gym) return { error: "Branch not found" };

  const { data: membership } = await admin
    .from("organization_members")
    .select("id, role")
    .eq("organization_id", gym.organization_id)
    .eq("auth_user_id", user.id)
    .eq("role", "owner")
    .maybeSingle();

  if (!membership) {
    return { error: "Only the organization owner can switch branches" };
  }

  // Ensure owner staff row exists on this branch
  const { data: existingStaff } = await admin
    .from("staff")
    .select("id")
    .eq("gym_id", gym.id)
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!existingStaff) {
    const displayName =
      (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
      user.email ||
      "Owner";

    const { error: staffError } = await admin.from("staff").insert({
      gym_id: gym.id,
      auth_user_id: user.id,
      name: displayName,
      email: user.email,
      role: "owner",
      status: "active",
    });

    if (staffError) return { error: staffError.message };
  }

  await setActiveBranchMetadata(
    user.id,
    gym.id,
    gym.organization_id,
    "owner",
  );

  return { error: null };
}

async function setActiveBranchMetadata(
  userId: string,
  gymId: string,
  organizationId: string,
  role: string,
) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      gym_id: gymId,
      organization_id: organizationId,
      role,
    },
  });
  if (error) throw new Error(error.message);
}
