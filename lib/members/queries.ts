import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Attendance,
  FeeDue,
  Member,
  MemberListItem,
  MemberProfile,
  MembersListResult,
  PaymentWithStaff,
} from "@/lib/types";
import {
  computeFeeDisplayStatus,
  memberMatchesFeeFilter,
} from "@/lib/members/fee-status";
import { parseMemberNotes } from "@/lib/members/notes";
import type { MemberFilter, MemberSort } from "@/lib/validations/members";

const PAGE_SIZE = 20;

const MEMBER_COLUMNS =
  "id, gym_id, member_code, name, phone, whatsapp, email, photo_url, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, height_cm, weight_kg, bmi, fitness_goals, package_id, membership_start, membership_end, status, freeze_start, freeze_end, freeze_reason, card_qr_token, card_issued_at, card_printed, referred_by, notes, joined_at, created_at, updated_at";

const FEE_DUE_COLUMNS =
  "id, gym_id, member_id, amount_due, amount_paid, due_date, status, generated_for_month, last_reminder_sent_at, reminder_count, notes, created_at, updated_at";

const PAYMENT_COLUMNS =
  "id, gym_id, member_id, amount, payment_type, payment_method, is_partial, covers_from, covers_to, notes, receipt_sent, receipt_generated, recorded_by, paid_at, created_at";

const ATTENDANCE_COLUMNS =
  "id, gym_id, member_id, staff_id, person_type, check_in_method, check_in_at, check_out_at, fee_status_at_checkin, notes, created_at";

type RawMemberRow = Member & {
  packages: { name: string } | { name: string }[] | null;
  fee_dues: Pick<FeeDue, "status" | "due_date" | "amount_due" | "amount_paid">[];
  attendance: Pick<Attendance, "check_in_at">[];
};

function unwrapPackage(
  pkg: RawMemberRow["packages"],
): { name: string } | null {
  if (!pkg) return null;
  if (Array.isArray(pkg)) return pkg[0] ?? null;
  return pkg;
}

function toListItem(row: RawMemberRow): MemberListItem {
  const { packages, fee_dues, attendance, ...member } = row;
  const feeDues = fee_dues ?? [];
  const checkIns = (attendance ?? [])
    .map((a) => a.check_in_at)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const pkg = unwrapPackage(packages);

  return {
    ...member,
    package_name: pkg?.name ?? null,
    fee_status: computeFeeDisplayStatus(member.status, feeDues),
    last_check_in: checkIns[0] ?? null,
  };
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function isNewThisMonth(joinedAt: string) {
  const joined = new Date(joinedAt);
  const now = new Date();
  return (
    joined.getFullYear() === now.getFullYear() &&
    joined.getMonth() === now.getMonth()
  );
}

async function getFeeFilterMemberIds(
  supabase: SupabaseClient,
  gymId: string,
  filter: "overdue" | "due_soon",
): Promise<string[]> {
  const today = new Date().toISOString().slice(0, 10);
  const inSevenDays = new Date();
  inSevenDays.setDate(inSevenDays.getDate() + 7);
  const sevenDaysStr = inSevenDays.toISOString().slice(0, 10);

  if (filter === "overdue") {
    const { data } = await supabase
      .from("fee_dues")
      .select("member_id")
      .eq("gym_id", gymId)
      .or(`status.eq.overdue,and(status.in.(pending,partial),due_date.lt.${today})`);
    return [...new Set((data ?? []).map((r) => r.member_id))];
  }

  const { data } = await supabase
    .from("fee_dues")
    .select("member_id")
    .eq("gym_id", gymId)
    .in("status", ["pending", "partial"])
    .gte("due_date", today)
    .lte("due_date", sevenDaysStr);

  return [...new Set((data ?? []).map((r) => r.member_id))];
}

function applySort(items: MemberListItem[], sort: MemberSort): MemberListItem[] {
  const sorted = [...items];
  switch (sort) {
    case "name_asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name_desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "joined_asc":
      return sorted.sort(
        (a, b) =>
          new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime(),
      );
    case "joined_desc":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime(),
      );
  }
}

function decodeCursor(cursor: string | undefined): { joined_at: string; id: string } | null {
  if (!cursor) return null;
  try {
    const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (decoded?.joined_at && decoded?.id) return decoded;
  } catch {
    return null;
  }
  return null;
}

export function encodeCursor(joined_at: string, id: string) {
  return Buffer.from(JSON.stringify({ joined_at, id })).toString("base64url");
}

export type MembersListParams = {
  search?: string;
  filter?: MemberFilter;
  sort?: MemberSort;
  cursor?: string;
};

export async function fetchMembersList(
  supabase: SupabaseClient,
  gymId: string,
  params: MembersListParams = {},
): Promise<MembersListResult> {
  const filter = params.filter ?? "all";
  const sort = params.sort ?? "joined_desc";
  const search = params.search?.trim();

  let query = supabase
    .from("members")
    .select(
      `
      id, gym_id, member_code, name, phone, photo_url, status, joined_at,
      packages(name),
      fee_dues(status, due_date, amount_due, amount_paid)
    `,
    )
    .eq("gym_id", gymId)
    .neq("status", "cancelled");

  if (filter === "active") {
    query = query.eq("status", "active");
  } else if (filter === "frozen") {
    query = query.eq("status", "frozen");
  } else if (filter === "new") {
    query = query.gte("joined_at", startOfMonth().toISOString());
  } else if (filter === "overdue" || filter === "due_soon") {
    const ids = await getFeeFilterMemberIds(supabase, gymId, filter);
    if (ids.length === 0) {
      const counts = await fetchFilterCounts(supabase, gymId);
      return {
        data: [],
        meta: { nextCursor: null, total: 0, counts },
      };
    }
    query = query.in("id", ids);
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,phone.ilike.%${search}%,member_code.ilike.%${search}%`,
    );
  }

  const cursor = decodeCursor(params.cursor);
  if (cursor) {
    query = query.or(
      `joined_at.lt.${cursor.joined_at},and(joined_at.eq.${cursor.joined_at},id.lt.${cursor.id})`,
    );
  }

  query = query
    .order("joined_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE_SIZE + 1);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const rawRows = (data ?? []) as unknown as RawMemberRow[];
  const pageIds = rawRows.map((r) => r.id);

  const lastCheckInByMember = new Map<string, string>();
  if (pageIds.length > 0) {
    const since = new Date();
    since.setDate(since.getDate() - 180);
    const { data: attendanceRows, error: attError } = await supabase
      .from("attendance")
      .select("member_id, check_in_at")
      .eq("gym_id", gymId)
      .in("member_id", pageIds)
      .gte("check_in_at", since.toISOString())
      .order("check_in_at", { ascending: false });

    if (attError) throw new Error(attError.message);

    for (const row of attendanceRows ?? []) {
      if (!row.member_id || !row.check_in_at) continue;
      if (!lastCheckInByMember.has(row.member_id)) {
        lastCheckInByMember.set(row.member_id, row.check_in_at);
      }
    }
  }

  let items = rawRows.map((row) => {
    const last = lastCheckInByMember.get(row.id);
    return toListItem({
      ...row,
      attendance: last ? [{ check_in_at: last }] : [],
    });
  });

  if (filter === "overdue" || filter === "due_soon") {
    items = items.filter((m) =>
      memberMatchesFeeFilter(m.fee_status.kind, filter),
    );
  }

  items = applySort(items, sort);

  const hasMore = items.length > PAGE_SIZE;
  const page = hasMore ? items.slice(0, PAGE_SIZE) : items;
  const last = page[page.length - 1];
  const nextCursor =
    hasMore && last ? encodeCursor(last.joined_at, last.id) : null;

  const counts = await fetchFilterCounts(supabase, gymId, search);

  return {
    data: page,
    meta: {
      nextCursor,
      total: counts.all,
      counts,
    },
  };
}

export async function fetchFilterCounts(
  supabase: SupabaseClient,
  gymId: string,
  search?: string,
): Promise<MembersListResult["meta"]["counts"]> {
  const base = () => {
    let q = supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .neq("status", "cancelled");
    if (search) {
      q = q.or(
        `name.ilike.%${search}%,phone.ilike.%${search}%,member_code.ilike.%${search}%`,
      );
    }
    return q;
  };

  const [allRes, activeRes, frozenRes, newRes, overdueIds, dueSoonIds] =
    await Promise.all([
      base(),
      base().eq("status", "active"),
      base().eq("status", "frozen"),
      base().gte("joined_at", startOfMonth().toISOString()),
      getFeeFilterMemberIds(supabase, gymId, "overdue"),
      getFeeFilterMemberIds(supabase, gymId, "due_soon"),
    ]);

  return {
    all: allRes.count ?? 0,
    active: activeRes.count ?? 0,
    frozen: frozenRes.count ?? 0,
    new: newRes.count ?? 0,
    overdue: overdueIds.length,
    due_soon: dueSoonIds.length,
  };
}

function computeStreak(attendance: Pick<Attendance, "check_in_at">[]): number {
  if (!attendance.length) return 0;

  const days = new Set(
    attendance.map((a) => new Date(a.check_in_at).toDateString()),
  );
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export async function fetchMemberById(
  supabase: SupabaseClient,
  gymId: string,
  id: string,
): Promise<MemberProfile | null> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const monthStart = startOfMonth();

  const { data: member, error } = await supabase
    .from("members")
    .select(MEMBER_COLUMNS)
    .eq("gym_id", gymId)
    .eq("id", id)
    .neq("status", "cancelled")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!member) return null;

  const [
    packageRes,
    feeDuesRes,
    allFeeDuesRes,
    paymentsRes,
    attendance30Res,
    attendanceMonthRes,
  ] = await Promise.all([
    member.package_id
      ? supabase
          .from("packages")
          .select("name, price, duration_days, color")
          .eq("gym_id", gymId)
          .eq("id", member.package_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("fee_dues")
      .select(FEE_DUE_COLUMNS)
      .eq("gym_id", gymId)
      .eq("member_id", id)
      .not("status", "in", '("paid","waived")')
      .order("due_date", { ascending: true }),
    supabase
      .from("fee_dues")
      .select("status, due_date, amount_due, amount_paid")
      .eq("gym_id", gymId)
      .eq("member_id", id),
    supabase
      .from("payments")
      .select(`${PAYMENT_COLUMNS}, staff(name)`)
      .eq("gym_id", gymId)
      .eq("member_id", id)
      .order("paid_at", { ascending: false })
      .limit(50),
    supabase
      .from("attendance")
      .select(ATTENDANCE_COLUMNS)
      .eq("gym_id", gymId)
      .eq("member_id", id)
      .eq("person_type", "member")
      .gte("check_in_at", thirtyDaysAgo.toISOString())
      .order("check_in_at", { ascending: false }),
    supabase
      .from("attendance")
      .select(ATTENDANCE_COLUMNS)
      .eq("gym_id", gymId)
      .eq("member_id", id)
      .eq("person_type", "member")
      .gte("check_in_at", monthStart.toISOString())
      .order("check_in_at", { ascending: false }),
  ]);

  const feeDuesForStatus = allFeeDuesRes.data ?? [];
  const attendance30 = (attendance30Res.data ?? []) as Attendance[];
  const attendanceMonth = (attendanceMonthRes.data ?? []) as Attendance[];

  const recentPayments: PaymentWithStaff[] = (paymentsRes.data ?? []).map(
    (p) => {
      const row = p as PaymentWithStaff & {
        staff: { name: string } | { name: string }[] | null;
      };
      const staff = Array.isArray(row.staff) ? row.staff[0] : row.staff;
      return {
        ...row,
        receipt_generated: Boolean(row.receipt_generated),
        receipt_sent: Boolean(row.receipt_sent),
        recorded_by_name: staff?.name ?? null,
      };
    },
  );

  return {
    ...(member as Member),
    package: packageRes.data,
    fee_status: computeFeeDisplayStatus(member.status, feeDuesForStatus),
    outstanding_dues: (feeDuesRes.data ?? []) as FeeDue[],
    recent_payments: recentPayments,
    attendance_30d: attendance30,
    attendance_month: attendanceMonth,
    check_in_streak: computeStreak(attendance30),
    notes_list: parseMemberNotes(member.notes),
  };
}

export { isNewThisMonth, PAGE_SIZE };
