import type { SupabaseClient } from "@supabase/supabase-js";

export type MemberSearchHit = {
  id: string;
  name: string;
  photo_url: string | null;
  member_code: string;
  package_name: string | null;
};

export type SearchMembersOptions = {
  limit?: number;
  /** Default: active only. Pass "not_cancelled" for cards. */
  status?: "active" | "not_cancelled";
  /** Include phone in or-filter (default true). */
  includePhone?: boolean;
};

type MemberSearchRow = {
  id: string;
  name: string;
  photo_url: string | null;
  member_code: string;
  packages: { name: string } | { name: string }[] | null;
};

/**
 * Shared member typeahead search used by attendance, cards, and inventory.
 */
export async function searchMembers(
  supabase: SupabaseClient,
  gymId: string,
  query: string,
  opts: SearchMembersOptions = {},
): Promise<MemberSearchHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { limit = 12, status = "active", includePhone = true } = opts;

  let q = supabase
    .from("members")
    .select("id, name, photo_url, member_code, packages(name)")
    .eq("gym_id", gymId)
    .order("name")
    .limit(limit);

  if (status === "active") {
    q = q.eq("status", "active");
  } else {
    q = q.neq("status", "cancelled");
  }

  const orFilter = includePhone
    ? `name.ilike.%${trimmed}%,phone.ilike.%${trimmed}%,member_code.ilike.%${trimmed}%`
    : `name.ilike.%${trimmed}%,member_code.ilike.%${trimmed}%`;

  q = q.or(orFilter);

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as MemberSearchRow[]).map((row) => {
    const pkg = Array.isArray(row.packages) ? row.packages[0] : row.packages;
    return {
      id: row.id,
      name: row.name,
      photo_url: row.photo_url,
      member_code: row.member_code,
      package_name: pkg?.name ?? null,
    };
  });
}
