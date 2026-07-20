import type { SupabaseClient } from "@supabase/supabase-js";
import type { Package } from "@/lib/types";

export async function fetchPackagesForAdmin(
  supabase: SupabaseClient,
  gymId: string,
): Promise<Package[]> {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
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
    .select("*")
    .eq("gym_id", gymId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Package) ?? null;
}
