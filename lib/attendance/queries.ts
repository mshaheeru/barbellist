import type { SupabaseClient } from "@supabase/supabase-js";
import {
  computeFeeSnapshotAtCheckin,
  deniedStatusForMember,
  isDeniedCheckInStatus,
} from "@/lib/attendance/fee-snapshot";
import {
  formatHourLabel,
  formatPeakHourRange,
  getDateRangeBounds,
  getGymTimezone,
  getHourInTimezone,
  getTodayStartIso,
  isLateCheckIn,
} from "@/lib/attendance/timezone";
import { searchMembers } from "@/lib/members/search";
import type {
  Attendance,
  AttendanceDateRange,
  AttendanceFeedItem,
  AttendancePersonFilter,
  AttendanceSidebarStats,
  CheckInMethod,
  CheckInResult,
  FeeDue,
  LiveGymCounts,
  Member,
  StaffRole,
} from "@/lib/types";
import type { AttendanceDateRange as DateRange } from "@/lib/validations/attendance";

const ATTENDANCE_COLUMNS =
  "id, gym_id, member_id, staff_id, person_type, check_in_method, check_in_at, check_out_at, fee_status_at_checkin, notes, created_at";

const MEMBER_CHECKIN_COLUMNS =
  "id, gym_id, member_code, name, phone, whatsapp, email, photo_url, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, height_cm, weight_kg, bmi, fitness_goals, package_id, membership_start, membership_end, status, freeze_start, freeze_end, freeze_reason, card_qr_token, card_issued_at, card_printed, referred_by, notes, joined_at, created_at, updated_at";

type RawAttendanceRow = Attendance & {
  members: {
    id: string;
    name: string;
    photo_url: string | null;
    member_code: string;
    status: Member["status"];
    packages: { name: string } | { name: string }[] | null;
  } | null;
  staff: {
    id: string;
    name: string;
    photo_url: string | null;
    role: StaffRole;
  } | null;
};

function unwrapPackage(
  pkg: RawAttendanceRow["members"] extends infer M
    ? M extends { packages: infer P }
      ? P
      : never
    : never,
): string | null {
  if (!pkg) return null;
  if (Array.isArray(pkg)) return pkg[0]?.name ?? null;
  return (pkg as { name: string }).name ?? null;
}

function formatStaffRole(role: StaffRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function toFeedItem(row: RawAttendanceRow): AttendanceFeedItem {
  if (row.person_type === "staff" && row.staff) {
    return {
      id: row.id,
      check_in_at: row.check_in_at,
      check_in_method: row.check_in_method,
      person_type: "staff",
      fee_status_at_checkin: row.fee_status_at_checkin,
      name: row.staff.name,
      photo_url: row.staff.photo_url,
      member_code: null,
      package_name: null,
      staff_role: row.staff.role,
      staff_role_label: formatStaffRole(row.staff.role),
      subtitle: `Staff · ${formatStaffRole(row.staff.role)}`,
    };
  }

  const member = row.members;
  const pkgName = member ? unwrapPackage(member.packages as never) : null;
  const denied = isDeniedCheckInStatus(row.fee_status_at_checkin);
  const statusWord =
    row.fee_status_at_checkin === "denied_frozen"
      ? "Frozen"
      : row.fee_status_at_checkin === "denied_expired"
        ? "Expired"
        : row.fee_status_at_checkin === "denied_cancelled"
          ? "Cancelled"
          : null;

  return {
    id: row.id,
    check_in_at: row.check_in_at,
    check_in_method: row.check_in_method,
    person_type: "member",
    fee_status_at_checkin: row.fee_status_at_checkin,
    name: member?.name ?? "Unknown",
    photo_url: member?.photo_url ?? null,
    member_code: member?.member_code ?? null,
    package_name: pkgName,
    staff_role: null,
    staff_role_label: null,
    subtitle: member
      ? denied && statusWord
        ? `Alert · ${statusWord} membership · ${member.member_code}`
        : `${pkgName ?? "Member"} · ${member.member_code}`
      : "Member",
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

async function getGymTimezoneFromDb(
  supabase: SupabaseClient,
  gymId: string,
): Promise<string> {
  const { data } = await supabase
    .from("gyms")
    .select("timezone")
    .eq("id", gymId)
    .maybeSingle();
  return getGymTimezone(data?.timezone);
}

export async function fetchAttendanceFeed(
  supabase: SupabaseClient,
  gymId: string,
  dateRange: DateRange,
  personFilter: AttendancePersonFilter,
): Promise<AttendanceFeedItem[]> {
  const timeZone = await getGymTimezoneFromDb(supabase, gymId);
  const { start, end } = getDateRangeBounds(dateRange, timeZone);

  let query = supabase
    .from("attendance")
    .select(
      `
      *,
      members(id, name, photo_url, member_code, status, packages(name)),
      staff(id, name, photo_url, role)
    `,
    )
    .eq("gym_id", gymId)
    .gte("check_in_at", start)
    .lte("check_in_at", end)
    .order("check_in_at", { ascending: false })
    .limit(200);

  if (personFilter === "member") {
    query = query.eq("person_type", "member");
  } else if (personFilter === "staff") {
    query = query.eq("person_type", "staff");
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return ((data ?? []) as RawAttendanceRow[]).map(toFeedItem);
}

export async function fetchAttendanceFeedItemById(
  supabase: SupabaseClient,
  gymId: string,
  id: string,
): Promise<AttendanceFeedItem | null> {
  const { data, error } = await supabase
    .from("attendance")
    .select(
      `
      *,
      members(id, name, photo_url, member_code, status, packages(name)),
      staff(id, name, photo_url, role)
    `,
    )
    .eq("gym_id", gymId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return toFeedItem(data as RawAttendanceRow);
}

export async function fetchLiveGymCounts(
  supabase: SupabaseClient,
  gymId: string,
): Promise<LiveGymCounts> {
  const timeZone = await getGymTimezoneFromDb(supabase, gymId);
  const todayStart = getTodayStartIso(timeZone);

  const [openRes, todayRes] = await Promise.all([
    supabase
      .from("attendance")
      .select("person_type, fee_status_at_checkin")
      .eq("gym_id", gymId)
      .is("check_out_at", null)
      .gte("check_in_at", todayStart),
    supabase
      .from("attendance")
      .select("check_in_at, fee_status_at_checkin")
      .eq("gym_id", gymId)
      .gte("check_in_at", todayStart),
  ]);

  if (openRes.error) throw new Error(openRes.error.message);
  if (todayRes.error) throw new Error(todayRes.error.message);

  const openSessions = (openRes.data ?? []).filter(
    (row) => !isDeniedCheckInStatus(row.fee_status_at_checkin),
  );
  const todayRows = (todayRes.data ?? []).filter(
    (row) => !isDeniedCheckInStatus(row.fee_status_at_checkin),
  );

  let membersInGym = 0;
  let staffInGym = 0;
  for (const row of openSessions) {
    if (row.person_type === "staff") staffInGym += 1;
    else membersInGym += 1;
  }

  const checkInsToday = todayRows.length;
  const hourCounts = new Map<number, number>();

  for (const row of todayRows) {
    const hour = getHourInTimezone(row.check_in_at, timeZone);
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
  }

  let peakHour = 0;
  let peakCount = 0;
  for (const [hour, count] of hourCounts) {
    if (count > peakCount) {
      peakCount = count;
      peakHour = hour;
    }
  }

  const peakHourLabel =
    peakCount > 0 ? formatPeakHourRange(peakHour) : "—";

  return {
    membersInGym,
    staffInGym,
    checkInsToday,
    peakHourLabel,
  };
}

export async function fetchAttendanceSidebarStats(
  supabase: SupabaseClient,
  gymId: string,
  dateRange: AttendanceDateRange,
): Promise<AttendanceSidebarStats> {
  const timeZone = await getGymTimezoneFromDb(supabase, gymId);
  const { start, end } = getDateRangeBounds(dateRange, timeZone);
  const todayStart = getTodayStartIso(timeZone);

  const [rangeRes, activeStaffRes, staffTodayRes, openMemberRes] =
    await Promise.all([
      supabase
        .from("attendance")
        .select(
          "check_in_at, member_id, person_type, staff_id, fee_status_at_checkin",
        )
        .eq("gym_id", gymId)
        .gte("check_in_at", start)
        .lte("check_in_at", end),
      supabase
        .from("staff")
        .select("id", { count: "exact", head: true })
        .eq("gym_id", gymId)
        .eq("status", "active"),
      supabase
        .from("attendance")
        .select("check_in_at, staff_id")
        .eq("gym_id", gymId)
        .eq("person_type", "staff")
        .gte("check_in_at", todayStart)
        .is("check_out_at", null),
      supabase
        .from("attendance")
        .select("member_id, fee_status_at_checkin")
        .eq("gym_id", gymId)
        .eq("person_type", "member")
        .is("check_out_at", null)
        .gte("check_in_at", todayStart),
    ]);

  if (rangeRes.error) throw new Error(rangeRes.error.message);

  const records = (rangeRes.data ?? []).filter(
    (r) => !isDeniedCheckInStatus(r.fee_status_at_checkin),
  );
  const uniqueMembers = new Set(
    records.filter((r) => r.person_type === "member").map((r) => r.member_id),
  );

  const hourBuckets = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: 0,
  }));

  for (const row of records) {
    const hour = getHourInTimezone(row.check_in_at, timeZone);
    hourBuckets[hour].count += 1;
  }

  const maxCount = Math.max(...hourBuckets.map((b) => b.count), 1);
  const hourlyTraffic = hourBuckets
    .filter((b) => b.hour >= 6 && b.hour <= 21)
    .map((b) => ({
      hour: b.hour,
      label: formatHourLabel(b.hour),
      count: b.count,
      heightPct: Math.round((b.count / maxCount) * 100),
    }));

  const activeStaffCount = activeStaffRes.count;
  const staffToday = staffTodayRes.data;

  const clockedInStaff = new Set(
    (staffToday ?? []).map((r) => r.staff_id).filter(Boolean),
  ).size;

  let lateArrivals = 0;
  for (const row of staffToday ?? []) {
    if (isLateCheckIn(row.check_in_at, timeZone, 9)) {
      lateArrivals += 1;
    }
  }

  const currentlyInside = new Set(
    (openMemberRes.data ?? [])
      .filter((r) => !isDeniedCheckInStatus(r.fee_status_at_checkin))
      .map((r) => r.member_id),
  ).size;

  return {
    totalCheckIns: records.length,
    uniqueMembers: uniqueMembers.size,
    currentlyInside,
    noShowsBooked: 0,
    staffClockedIn: clockedInStaff,
    staffTotal: activeStaffCount ?? 0,
    lateArrivals,
    onLeaveToday: 0,
    hourlyTraffic,
  };
}

export async function searchMembersForCheckIn(
  supabase: SupabaseClient,
  gymId: string,
  query: string,
) {
  return searchMembers(supabase, gymId, query, {
    status: "active",
    includePhone: true,
  });
}

async function findOpenSession(
  supabase: SupabaseClient,
  gymId: string,
  opts: { memberId?: string; staffId?: string },
) {
  const timeZone = await getGymTimezoneFromDb(supabase, gymId);
  const todayStart = getTodayStartIso(timeZone);

  let query = supabase
    .from("attendance")
    .select(ATTENDANCE_COLUMNS)
    .eq("gym_id", gymId)
    .is("check_out_at", null)
    .gte("check_in_at", todayStart)
    .limit(1);

  if (opts.memberId) {
    query = query.eq("member_id", opts.memberId).eq("person_type", "member");
  } else if (opts.staffId) {
    query = query.eq("staff_id", opts.staffId).eq("person_type", "staff");
  }

  const { data } = await query.maybeSingle();
  return data as Attendance | null;
}

export async function getMemberCheckInContext(
  supabase: SupabaseClient,
  gymId: string,
  memberId: string,
) {
  const { data: member, error } = await supabase
    .from("members")
    .select(`${MEMBER_CHECKIN_COLUMNS}, packages(name)`)
    .eq("gym_id", gymId)
    .eq("id", memberId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!member) return null;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [feeDuesRes, monthAttendanceRes, streakAttendanceRes] =
    await Promise.all([
      supabase
        .from("fee_dues")
        .select("status, due_date, amount_due, amount_paid")
        .eq("gym_id", gymId)
        .eq("member_id", memberId),
      supabase
        .from("attendance")
        .select("id", { count: "exact", head: true })
        .eq("gym_id", gymId)
        .eq("member_id", memberId)
        .eq("person_type", "member")
        .gte("check_in_at", monthStart.toISOString()),
      supabase
        .from("attendance")
        .select("check_in_at")
        .eq("gym_id", gymId)
        .eq("member_id", memberId)
        .eq("person_type", "member")
        .gte("check_in_at", thirtyDaysAgo.toISOString()),
    ]);

  const feeDues = (feeDuesRes.data ?? []) as FeeDue[];
  const feeSnapshot = computeFeeSnapshotAtCheckin(
    member.status as Member["status"],
    feeDues,
  );

  const pkg = Array.isArray(member.packages)
    ? member.packages[0]
    : member.packages;

  return {
    member: member as Member,
    package_name: (pkg as { name: string } | null)?.name ?? null,
    feeSnapshot,
    monthCheckIns: monthAttendanceRes.count ?? 0,
    streak: computeStreak((streakAttendanceRes.data ?? []) as Attendance[]),
  };
}

export async function performMemberCheckIn(
  supabase: SupabaseClient,
  gymId: string,
  memberId: string,
  method: CheckInMethod,
): Promise<{ attendance: Attendance; result: CheckInResult; deduped: boolean }> {
  const context = await getMemberCheckInContext(supabase, gymId, memberId);
  if (!context) {
    throw new Error("Member not found");
  }

  if (context.member.status !== "active") {
    const deniedStatus = deniedStatusForMember(context.member.status);
    if (deniedStatus) {
      const now = new Date().toISOString();
      const { error: deniedError } = await supabase.from("attendance").insert({
        gym_id: gymId,
        member_id: memberId,
        person_type: "member",
        check_in_method: method,
        check_in_at: now,
        // Immediately closed so denied scans never count as "in gym"
        check_out_at: now,
        fee_status_at_checkin: deniedStatus,
        notes: `Denied check-in: membership ${context.member.status}`,
      });
      if (deniedError) throw new Error(deniedError.message);
    }

    const reason =
      context.member.status === "frozen"
        ? "frozen"
        : context.member.status === "expired"
          ? "expired"
          : context.member.status === "cancelled"
            ? "cancelled"
            : "inactive";
    throw new Error(`Member is not active (${reason})`);
  }

  const existing = await findOpenSession(supabase, gymId, { memberId });
  if (existing) {
    const feedItem = await fetchAttendanceFeedItemById(
      supabase,
      gymId,
      existing.id,
    );
    return {
      attendance: existing,
      deduped: true,
      result: buildCheckInResult(context, existing.id, feedItem, true),
    };
  }

  const { data: inserted, error } = await supabase
    .from("attendance")
    .insert({
      gym_id: gymId,
      member_id: memberId,
      person_type: "member",
      check_in_method: method,
      fee_status_at_checkin: context.feeSnapshot.snapshot,
    })
    .select(ATTENDANCE_COLUMNS)
    .single();

  if (error) throw new Error(error.message);

  const feedItem = await fetchAttendanceFeedItemById(
    supabase,
    gymId,
    inserted.id,
  );

  return {
    attendance: inserted as Attendance,
    deduped: false,
    result: buildCheckInResult(context, inserted.id, feedItem, false),
  };
}

export async function performStaffCheckIn(
  supabase: SupabaseClient,
  gymId: string,
  staffId: string,
  method: CheckInMethod,
): Promise<Attendance> {
  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("id, status")
    .eq("gym_id", gymId)
    .eq("id", staffId)
    .maybeSingle();

  if (staffError) throw new Error(staffError.message);
  if (!staff) throw new Error("Staff member not found");
  if (staff.status !== "active") throw new Error("Staff member is not active");

  const existing = await findOpenSession(supabase, gymId, { staffId });
  if (existing) return existing;

  const { data: inserted, error } = await supabase
    .from("attendance")
    .insert({
      gym_id: gymId,
      staff_id: staffId,
      person_type: "staff",
      check_in_method: method,
      fee_status_at_checkin: null,
    })
    .select(ATTENDANCE_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return inserted as Attendance;
}

function buildCheckInResult(
  context: NonNullable<Awaited<ReturnType<typeof getMemberCheckInContext>>>,
  attendanceId: string,
  feedItem: AttendanceFeedItem | null,
  alreadyCheckedIn: boolean,
): CheckInResult {
  // Fresh insert is not yet in the month query count — include it for display
  const monthCheckIns = alreadyCheckedIn
    ? Math.max(context.monthCheckIns, 1)
    : context.monthCheckIns + 1;

  const streak = alreadyCheckedIn
    ? Math.max(context.streak, 1)
    : Math.max(context.streak, 1);

  return {
    attendance_id: attendanceId,
    member_id: context.member.id,
    name: context.member.name,
    photo_url: context.member.photo_url,
    member_code: context.member.member_code,
    package_name: context.package_name,
    fee_snapshot: context.feeSnapshot.snapshot,
    fee_display: context.feeSnapshot.display,
    overdue_amount: context.feeSnapshot.overdueAmount,
    overdue_days: context.feeSnapshot.overdueDays,
    month_check_ins: monthCheckIns,
    streak,
    already_checked_in: alreadyCheckedIn,
    feed_item: feedItem,
  };
}

export type KioskMemberSearchResult = Awaited<
  ReturnType<typeof searchMembersForCheckIn>
>[number];
