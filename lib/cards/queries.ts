import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CardMember,
  CardMemberSearchResult,
  UnissuedCardMember,
} from "@/lib/cards/types";
import { searchMembers } from "@/lib/members/search";

function mapPackage(
  pkg: { id: string; name: string; color: string } | { id: string; name: string; color: string }[] | null,
) {
  if (!pkg) return null;
  const row = Array.isArray(pkg) ? pkg[0] : pkg;
  if (!row) return null;
  return { id: row.id, name: row.name, color: row.color };
}

export async function fetchCardMember(
  supabase: SupabaseClient,
  gymId: string,
  memberId: string,
): Promise<CardMember | null> {
  const { data, error } = await supabase
    .from("members")
    .select(
      "id, name, member_code, photo_url, membership_start, membership_end, card_qr_token, card_issued_at, card_printed, package_id, packages(id, name, color)",
    )
    .eq("gym_id", gymId)
    .eq("id", memberId)
    .neq("status", "cancelled")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as typeof data & {
    packages: { id: string; name: string; color: string } | null;
  };

  return {
    id: row.id,
    name: row.name,
    member_code: row.member_code,
    photo_url: row.photo_url,
    membership_start: row.membership_start,
    membership_end: row.membership_end,
    card_qr_token: row.card_qr_token,
    card_issued_at: row.card_issued_at,
    card_printed: row.card_printed,
    package_id: row.package_id,
    package: mapPackage(row.packages),
  };
}

export async function searchMembersForCards(
  supabase: SupabaseClient,
  gymId: string,
  query: string,
): Promise<CardMemberSearchResult[]> {
  return searchMembers(supabase, gymId, query, {
    status: "not_cancelled",
    includePhone: true,
  });
}

export async function fetchUnissuedMembers(
  supabase: SupabaseClient,
  gymId: string,
): Promise<UnissuedCardMember[]> {
  const { data, error } = await supabase
    .from("members")
    .select(
      "id, name, member_code, photo_url, membership_start, membership_end, package_id, packages(id, name, color)",
    )
    .eq("gym_id", gymId)
    .neq("status", "cancelled")
    .is("card_issued_at", null)
    .order("name");

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const r = row as typeof row & {
      packages: { id: string; name: string; color: string } | null;
    };
    return {
      id: r.id as string,
      name: r.name as string,
      member_code: r.member_code as string,
      photo_url: r.photo_url as string | null,
      membership_start: r.membership_start as string | null,
      membership_end: r.membership_end as string | null,
      package_id: r.package_id as string | null,
      package: mapPackage(r.packages),
    };
  });
}
