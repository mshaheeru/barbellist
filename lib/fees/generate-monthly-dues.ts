import type { SupabaseClient } from "@supabase/supabase-js";
import { firstOfMonthIso } from "@/lib/format/date";

export type GenerateMonthlyDuesResult = {
  created: number;
  markedOverdue: number;
};

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
  const monthStart = firstOfMonthIso();
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

  const memberList = members ?? [];
  const memberIds = memberList.map((m) => m.id);

  let created = 0;

  if (memberIds.length > 0) {
    const { data: existingDues, error: existingError } = await supabase
      .from("fee_dues")
      .select("member_id")
      .eq("gym_id", gymId)
      .eq("generated_for_month", monthStart)
      .in("member_id", memberIds);

    if (existingError) {
      throw new Error(existingError.message);
    }

    const existingSet = new Set(
      (existingDues ?? []).map((r) => r.member_id as string),
    );

    const toInsert: Array<{
      gym_id: string;
      member_id: string;
      amount_due: number;
      amount_paid: number;
      due_date: string;
      status: string;
      generated_for_month: string;
    }> = [];

    for (const member of memberList) {
      if (existingSet.has(member.id)) continue;

      const pkgRaw = member.packages as
        | { price: number }
        | { price: number }[]
        | null;
      const pkg = Array.isArray(pkgRaw) ? pkgRaw[0] : pkgRaw;
      if (!pkg) continue;

      toInsert.push({
        gym_id: gymId,
        member_id: member.id,
        amount_due: pkg.price,
        amount_paid: 0,
        due_date: monthStart,
        status: "pending",
        generated_for_month: monthStart,
      });
    }

    if (toInsert.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from("fee_dues")
        .insert(toInsert)
        .select("id");

      if (insertError) {
        throw new Error(insertError.message);
      }

      created = inserted?.length ?? toInsert.length;
    }
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
