import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FeeDue,
  FeeOverviewRow,
  FeesOverviewResult,
  FeesOverviewSummary,
  MemberPaymentContext,
} from "@/lib/types";
import { computeFeeDisplayStatus } from "@/lib/members/fee-status";
import type { FeeSort, FeeStatusFilter } from "@/lib/validations/fees";

const PAGE_SIZE = 20;

type RawFeeDueRow = {
  id: string;
  member_id: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: FeeOverviewRow["status"];
  generated_for_month: string | null;
  members:
    | {
        name: string;
        member_code: string;
        photo_url: string | null;
        status: string;
        packages: { name: string } | { name: string }[] | null;
      }
    | {
        name: string;
        member_code: string;
        photo_url: string | null;
        status: string;
        packages: { name: string } | { name: string }[] | null;
      }[]
    | null;
};

function unwrapMember(row: RawFeeDueRow): {
  name: string;
  member_code: string;
  photo_url: string | null;
  packages: { name: string } | { name: string }[] | null;
} | null {
  const member = row.members;
  if (!member) return null;
  if (Array.isArray(member)) return member[0] ?? null;
  return member;
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function computeDaysOverdue(dueDate: string, status: string): number | null {
  if (status !== "overdue") {
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (
      (status === "pending" || status === "partial") &&
      due.getTime() < today.getTime()
    ) {
      return Math.round(
        (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
      );
    }
    return status === "overdue" ? 0 : null;
  }
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round(
    (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
  );
  return days > 0 ? days : 0;
}

function unwrapPackage(
  pkg: { name: string } | { name: string }[] | null | undefined,
): { name: string } | null {
  if (!pkg) return null;
  if (Array.isArray(pkg)) return pkg[0] ?? null;
  return pkg;
}

function toOverviewRow(row: RawFeeDueRow): FeeOverviewRow {
  const member = unwrapMember(row);
  const balance = Math.max(
    0,
    Number(row.amount_due) - Number(row.amount_paid ?? 0),
  );
  const pkg = member ? unwrapPackage(member.packages) : null;

  return {
    id: row.id,
    member_id: row.member_id,
    member_name: member?.name ?? "Unknown",
    member_code: member?.member_code ?? "—",
    photo_url: member?.photo_url ?? null,
    package_name: pkg?.name ?? null,
    amount_due: Number(row.amount_due),
    amount_paid: Number(row.amount_paid ?? 0),
    balance,
    due_date: row.due_date,
    status: row.status,
    days_overdue: computeDaysOverdue(row.due_date, row.status),
  };
}

function decodeCursor(
  cursor: string | undefined,
): { due_date: string; id: string } | null {
  if (!cursor) return null;
  try {
    const json = new TextDecoder().decode(
      Uint8Array.from(atob(cursor.replace(/-/g, "+").replace(/_/g, "/")), (c) =>
        c.charCodeAt(0),
      ),
    );
    const decoded = JSON.parse(json);
    if (decoded?.due_date && decoded?.id) return decoded;
  } catch {
    return null;
  }
  return null;
}

export function encodeFeeCursor(due_date: string, id: string) {
  const json = JSON.stringify({ due_date, id });
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function applyFeeSort(rows: FeeOverviewRow[], sort: FeeSort): FeeOverviewRow[] {
  const sorted = [...rows];
  switch (sort) {
    case "due_date_desc":
      return sorted.sort(
        (a, b) =>
          new Date(b.due_date).getTime() - new Date(a.due_date).getTime(),
      );
    case "amount_desc":
      return sorted.sort((a, b) => b.balance - a.balance);
    case "amount_asc":
      return sorted.sort((a, b) => a.balance - b.balance);
    case "overdue_desc":
      return sorted.sort(
        (a, b) => (b.days_overdue ?? -1) - (a.days_overdue ?? -1),
      );
    case "overdue_asc":
      return sorted.sort(
        (a, b) => (a.days_overdue ?? 9999) - (b.days_overdue ?? 9999),
      );
    case "due_date_asc":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
      );
  }
}

export async function fetchFeesSummary(
  supabase: SupabaseClient,
  gymId: string,
): Promise<FeesOverviewSummary> {
  const monthStart = startOfMonth().toISOString();
  const monthEnd = endOfMonth().toISOString();
  const today = todayStr();
  const inSevenDays = addDays(7);

  const [paymentsRes, duesRes, dueWeekRes, overdueMembersRes] =
    await Promise.all([
      supabase
        .from("payments")
        .select("amount")
        .eq("gym_id", gymId)
        .gte("paid_at", monthStart)
        .lte("paid_at", monthEnd),
      supabase
        .from("fee_dues")
        .select("amount_due, amount_paid, member_id")
        .eq("gym_id", gymId)
        .in("status", ["pending", "overdue", "partial"]),
      supabase
        .from("fee_dues")
        .select("amount_due, amount_paid")
        .eq("gym_id", gymId)
        .eq("status", "pending")
        .gte("due_date", today)
        .lte("due_date", inSevenDays),
      supabase
        .from("fee_dues")
        .select("member_id")
        .eq("gym_id", gymId)
        .eq("status", "overdue"),
    ]);

  const collectedThisMonth = (paymentsRes.data ?? []).reduce(
    (sum, p) => sum + Number(p.amount),
    0,
  );

  const outstanding = (duesRes.data ?? []).reduce(
    (sum, d) =>
      sum + Math.max(0, Number(d.amount_due) - Number(d.amount_paid ?? 0)),
    0,
  );

  const dueThisWeek = (dueWeekRes.data ?? []).reduce(
    (sum, d) =>
      sum + Math.max(0, Number(d.amount_due) - Number(d.amount_paid ?? 0)),
    0,
  );

  const overdueMemberCount = new Set(
    (overdueMembersRes.data ?? []).map((r) => r.member_id),
  ).size;

  return {
    collectedThisMonth,
    outstanding,
    dueThisWeek,
    overdueMemberCount,
  };
}

export type FeesTableParams = {
  status?: FeeStatusFilter;
  sort?: FeeSort;
  date_from?: string;
  date_to?: string;
  cursor?: string;
};

export async function fetchFeesTable(
  supabase: SupabaseClient,
  gymId: string,
  params: FeesTableParams = {},
): Promise<Pick<FeesOverviewResult, "data" | "meta">> {
  const status = params.status ?? "all";
  const sort = params.sort ?? "due_date_asc";

  let query = supabase
    .from("fee_dues")
    .select(
      `
      id, member_id, amount_due, amount_paid, due_date, status, generated_for_month,
      members!inner(name, member_code, photo_url, status, packages(name))
    `,
    )
    .eq("gym_id", gymId);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (params.date_from) {
    query = query.gte("due_date", params.date_from);
  }
  if (params.date_to) {
    query = query.lte("due_date", params.date_to);
  }

  const cursor = decodeCursor(params.cursor);
  if (cursor) {
    query = query.or(
      `due_date.gt.${cursor.due_date},and(due_date.eq.${cursor.due_date},id.gt.${cursor.id})`,
    );
  }

  query = query
    .order("due_date", { ascending: true })
    .order("id", { ascending: true })
    .limit(PAGE_SIZE + 1);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  let rows = ((data ?? []) as unknown as RawFeeDueRow[]).map(toOverviewRow);
  rows = applyFeeSort(rows, sort);

  const hasMore = rows.length > PAGE_SIZE;
  const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const last = page[page.length - 1];
  const nextCursor =
    hasMore && last ? encodeFeeCursor(last.due_date, last.id) : null;

  const { count } = await supabase
    .from("fee_dues")
    .select("id", { count: "exact", head: true })
    .eq("gym_id", gymId);

  return {
    data: page,
    meta: {
      total: count ?? page.length,
      nextCursor,
    },
  };
}

export async function fetchFeesOverview(
  supabase: SupabaseClient,
  gymId: string,
  params: FeesTableParams = {},
): Promise<FeesOverviewResult> {
  const [summary, table] = await Promise.all([
    fetchFeesSummary(supabase, gymId),
    fetchFeesTable(supabase, gymId, params),
  ]);

  return {
    summary,
    ...table,
  };
}

export async function fetchMemberPaymentContext(
  supabase: SupabaseClient,
  gymId: string,
  memberId: string,
): Promise<MemberPaymentContext | null> {
  const { data: member, error } = await supabase
    .from("members")
    .select(
      "id, name, member_code, photo_url, whatsapp, phone, status, package_id",
    )
    .eq("gym_id", gymId)
    .eq("id", memberId)
    .neq("status", "cancelled")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!member) return null;

  const [packageRes, duesRes] = await Promise.all([
    member.package_id
      ? supabase
          .from("packages")
          .select("name, price")
          .eq("gym_id", gymId)
          .eq("id", member.package_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("fee_dues")
      .select(
        "id, gym_id, member_id, amount_due, amount_paid, due_date, status, generated_for_month, last_reminder_sent_at, reminder_count, notes, created_at, updated_at",
      )
      .eq("gym_id", gymId)
      .eq("member_id", memberId)
      .not("status", "in", '("paid","waived")')
      .order("due_date", { ascending: true }),
  ]);

  const outstanding_dues = (duesRes.data ?? []) as FeeDue[];
  const total_balance = outstanding_dues.reduce(
    (sum, d) =>
      sum + Math.max(0, Number(d.amount_due) - Number(d.amount_paid ?? 0)),
    0,
  );

  const allDuesForStatus = outstanding_dues.map((d) => ({
    status: d.status,
    due_date: d.due_date,
    amount_due: d.amount_due,
    amount_paid: d.amount_paid,
  }));

  return {
    id: member.id,
    name: member.name,
    member_code: member.member_code,
    photo_url: member.photo_url,
    whatsapp: member.whatsapp,
    phone: member.phone,
    status: member.status,
    package: packageRes.data,
    outstanding_dues,
    total_balance,
    fee_status: computeFeeDisplayStatus(member.status, allDuesForStatus),
  };
}

export async function fetchFeeDueForReminder(
  supabase: SupabaseClient,
  gymId: string,
  feeDueId: string,
) {
  const { data, error } = await supabase
    .from("fee_dues")
    .select(
      `
      id, member_id, amount_due, amount_paid, due_date, status, generated_for_month, reminder_count,
      members!inner(name, whatsapp, phone, gym_id)
    `,
    )
    .eq("gym_id", gymId)
    .eq("id", feeDueId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
