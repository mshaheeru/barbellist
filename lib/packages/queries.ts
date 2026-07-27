import type { SupabaseClient } from "@supabase/supabase-js";
import type { Package } from "@/lib/types";

/** Columns matching Package — keep in sync with lib/types.ts */
export const PACKAGE_COLUMNS =
  "id, gym_id, name, description, price, duration_days, features, bmi_min, bmi_max, recommended_goals, color, is_active, sort_order, created_at, updated_at";

export async function fetchPackagesForAdmin(
  supabase: SupabaseClient,
  gymId: string,
): Promise<Package[]> {
  const { data, error } = await supabase
    .from("packages")
    .select(PACKAGE_COLUMNS)
    .eq("gym_id", gymId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Package[]) ?? [];
}

export async function fetchPackageById(
  supabase: SupabaseClient,
  gymId: string,
  id: string,
): Promise<Package | null> {
  const { data, error } = await supabase
    .from("packages")
    .select(PACKAGE_COLUMNS)
    .eq("gym_id", gymId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Package) ?? null;
}
