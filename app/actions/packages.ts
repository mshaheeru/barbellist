"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canManagePackages } from "@/lib/auth/permissions";
import {
  fetchPackageById,
  fetchPackagesForAdmin,
} from "@/lib/packages/queries";
import {
  packageFormSchema,
  reorderPackagesSchema,
  type PackageFormInput,
} from "@/lib/validations/packages";
import type { Package, StaffRole } from "@/lib/types";

type AuthContext = {
  gymId: string;
  userId: string;
  role: StaffRole;
};

async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const gymId = user.user_metadata?.gym_id as string | undefined;
  const role = user.user_metadata?.role as StaffRole | undefined;
  if (!gymId || !role) return null;

  return { gymId, userId: user.id, role };
}

function revalidatePackages() {
  revalidatePath("/dashboard/packages");
  revalidatePath("/dashboard/members/new");
}

function toDbRow(data: PackageFormInput) {
  const description = data.description?.trim() || null;
  const features = data.features.map((f) => f.trim()).filter(Boolean);
  return {
    name: data.name.trim(),
    description,
    price: data.price,
    duration_days: data.duration_days,
    features,
    bmi_min: data.bmi_min ?? null,
    bmi_max: data.bmi_max ?? null,
    recommended_goals:
      data.recommended_goals.length > 0 ? data.recommended_goals : null,
    color: data.color,
    is_active: data.is_active,
    sort_order: data.sort_order,
  };
}

export async function listPackages(): Promise<{
  data: Package[] | null;
  error: string | null;
}> {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return { data: null, error: "Not authenticated" };
    if (!canManagePackages(ctx.role)) {
      return { data: null, error: "You do not have access to packages" };
    }

    const supabase = await createClient();
    const data = await fetchPackagesForAdmin(supabase, ctx.gymId);
    return { data, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load packages",
    };
  }
}

export async function createPackage(
  raw: PackageFormInput,
): Promise<{ data: Package | null; error: string | null }> {
  const parsed = packageFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const ctx = await getAuthContext();
  if (!ctx) return { data: null, error: "Not authenticated" };
  if (!canManagePackages(ctx.role)) {
    return { data: null, error: "Only owners and managers can manage packages" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("packages")
    .insert({
      gym_id: ctx.gymId,
      ...toDbRow(parsed.data),
    })
    .select("*")
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Failed to create package" };
  }

  revalidatePackages();
  return { data: data as Package, error: null };
}

export async function updatePackage(
  id: string,
  raw: PackageFormInput,
): Promise<{ data: Package | null; error: string | null }> {
  const parsed = packageFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const ctx = await getAuthContext();
  if (!ctx) return { data: null, error: "Not authenticated" };
  if (!canManagePackages(ctx.role)) {
    return { data: null, error: "Only owners and managers can manage packages" };
  }

  const supabase = await createClient();
  const existing = await fetchPackageById(supabase, ctx.gymId, id);
  if (!existing) return { data: null, error: "Package not found" };

  const { data, error } = await supabase
    .from("packages")
    .update(toDbRow(parsed.data))
    .eq("id", id)
    .eq("gym_id", ctx.gymId)
    .select("*")
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Failed to update package" };
  }

  revalidatePackages();
  return { data: data as Package, error: null };
}

export async function deletePackage(
  id: string,
): Promise<{ error: string | null }> {
  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  if (!canManagePackages(ctx.role)) {
    return { error: "Only owners and managers can manage packages" };
  }

  const supabase = await createClient();
  const existing = await fetchPackageById(supabase, ctx.gymId, id);
  if (!existing) return { error: "Package not found" };

  const { error } = await supabase
    .from("packages")
    .delete()
    .eq("id", id)
    .eq("gym_id", ctx.gymId);

  if (error) return { error: error.message };

  revalidatePackages();
  return { error: null };
}

export async function togglePackageActive(
  id: string,
): Promise<{ data: Package | null; error: string | null }> {
  const ctx = await getAuthContext();
  if (!ctx) return { data: null, error: "Not authenticated" };
  if (!canManagePackages(ctx.role)) {
    return { data: null, error: "Only owners and managers can manage packages" };
  }

  const supabase = await createClient();
  const existing = await fetchPackageById(supabase, ctx.gymId, id);
  if (!existing) return { data: null, error: "Package not found" };

  const { data, error } = await supabase
    .from("packages")
    .update({ is_active: !existing.is_active })
    .eq("id", id)
    .eq("gym_id", ctx.gymId)
    .select("*")
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Failed to update package" };
  }

  revalidatePackages();
  return { data: data as Package, error: null };
}

export async function reorderPackages(
  orderedIds: string[],
): Promise<{ error: string | null }> {
  const parsed = reorderPackagesSchema.safeParse({ orderedIds });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  if (!canManagePackages(ctx.role)) {
    return { error: "Only owners and managers can manage packages" };
  }

  const supabase = await createClient();
  const updates = parsed.data.orderedIds.map((id, index) =>
    supabase
      .from("packages")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("gym_id", ctx.gymId),
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePackages();
  return { error: null };
}
