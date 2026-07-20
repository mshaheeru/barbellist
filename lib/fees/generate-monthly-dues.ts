import type { SupabaseClient } from "@supabase/supabase-js";

export type GenerateMonthlyDuesResult = {
  created: number;
  markedOverdue: number;
};

function firstOfMonth(d = new Date()): string {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Generate monthly fee_dues for active members and mark past-due rows overdue.
 * Intended to be called daily via Supabase Edge Function cron (Prompt 12).
 */
export async function generateMonthlyDues(
  supabase: SupabaseClient,
  gymId: string,
): Promise<GenerateMonthlyDuesResult> {
  const monthStart = firstOfMonth();
  const today = todayStr();

  const { data: members, error: membersError } = await supabase
    .from("members")
    .select("id, package_id, packages(price)")
    .eq("gym_id", gymId)
    .eq("status", "active")
    .not("package_id", "is", null);

  if (membersError) {
    throw new Error(membersError.message);
  }

  let created = 0;

  for (const member of members ?? []) {
    const pkgRaw = member.packages as
      | { price: number }
      | { price: number }[]
      | null;
    const pkg = Array.isArray(pkgRaw) ? pkgRaw[0] : pkgRaw;
    if (!pkg) continue;

    const { data: existing } = await supabase
      .from("fee_dues")
      .select("id")
      .eq("gym_id", gymId)
      .eq("member_id", member.id)
      .eq("generated_for_month", monthStart)
      .maybeSingle();

    if (existing) continue;

    const { error: insertError } = await supabase.from("fee_dues").insert({
      gym_id: gymId,
      member_id: member.id,
      amount_due: pkg.price,
      amount_paid: 0,
      due_date: monthStart,
      status: "pending",
      generated_for_month: monthStart,
    });

    if (!insertError) created += 1;
  }

  const { data: overdueCandidates, error: overdueFetchError } = await supabase
    .from("fee_dues")
    .select("id")
    .eq("gym_id", gymId)
    .in("status", ["pending", "partial"])
    .lt("due_date", today);

  if (overdueFetchError) {
    throw new Error(overdueFetchError.message);
  }

  const ids = (overdueCandidates ?? []).map((r) => r.id);
  let markedOverdue = 0;

  if (ids.length > 0) {
    const { data: updated, error: updateError } = await supabase
      .from("fee_dues")
      .update({ status: "overdue" })
      .eq("gym_id", gymId)
      .in("id", ids)
      .select("id");

    if (updateError) {
      throw new Error(updateError.message);
    }

    markedOverdue = updated?.length ?? 0;
  }

  return { created, markedOverdue };
}
