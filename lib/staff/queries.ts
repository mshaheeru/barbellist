import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Attendance,
  Expense,
  SalaryExpenseRow,
  Staff,
  StaffListItem,
  StaffListResult,
  StaffProfile,
} from "@/lib/types";
import { parseMemberNotes } from "@/lib/members/notes";
import {
  addMonthsIso,
  countWorkingDaysInMonth,
  firstOfMonthIso,
} from "@/lib/staff/format";
import type { StaffFilter, StaffSort } from "@/lib/validations/staff";

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfDayIso(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return x.toISOString();
}

function uniqueAttendanceDays(rows: { check_in_at: string }[]): number {
  const days = new Set(
    rows.map((r) => new Date(r.check_in_at).toDateString()),
  );
  return days.size;
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

function applySort(items: StaffListItem[], sort: StaffSort): StaffListItem[] {
  const sorted = [...items];
  switch (sort) {
    case "name_desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "joined_asc":
      return sorted.sort(
        (a, b) =>
          new Date(a.joining_date).getTime() -
          new Date(b.joining_date).getTime(),
      );
    case "joined_desc":
      return sorted.sort(
        (a, b) =>
          new Date(b.joining_date).getTime() -
          new Date(a.joining_date).getTime(),
      );
    case "salary_desc":
      return sorted.sort(
        (a, b) => (b.monthly_salary ?? 0) - (a.monthly_salary ?? 0),
      );
    case "salary_asc":
      return sorted.sort(
        (a, b) => (a.monthly_salary ?? 0) - (b.monthly_salary ?? 0),
      );
    case "name_asc":
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export type StaffListParams = {
  search?: string;
  filter?: StaffFilter;
  sort?: StaffSort;
};

export async function fetchStaffList(
  supabase: SupabaseClient,
  gymId: string,
  params: StaffListParams = {},
  opts: { canViewSalary: boolean } = { canViewSalary: false },
): Promise<StaffListResult> {
  const filter = params.filter ?? "all";
  const sort = params.sort ?? "name_asc";
  const search = params.search?.trim();

  let query = supabase.from("staff").select("*").eq("gym_id", gymId);

  if (filter !== "all") {
    query = query.eq("role", filter);
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,role.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`,
    );
  }

  const { data, error } = await query.order("name", { ascending: true });

  if (error) throw new Error(error.message);

  const staffRows = (data ?? []) as Staff[];
  const now = new Date();
  const monthStart = startOfMonth(now);
  const workingDays = countWorkingDaysInMonth(
    now.getFullYear(),
    now.getMonth(),
  );
  const todayStart = startOfDayIso(now);

  const staffIds = staffRows.map((s) => s.id);

  const [attendanceMonthRes, attendanceTodayRes, counts] = await Promise.all([
    staffIds.length
      ? supabase
          .from("attendance")
          .select("staff_id, check_in_at")
          .eq("gym_id", gymId)
          .eq("person_type", "staff")
          .in("staff_id", staffIds)
          .gte("check_in_at", monthStart.toISOString())
      : Promise.resolve({ data: [] as { staff_id: string; check_in_at: string }[] }),
    staffIds.length
      ? supabase
          .from("attendance")
          .select("staff_id")
          .eq("gym_id", gymId)
          .eq("person_type", "staff")
          .in("staff_id", staffIds)
          .gte("check_in_at", todayStart)
      : Promise.resolve({ data: [] as { staff_id: string }[] }),
    fetchRoleCounts(supabase, gymId),
  ]);

  const monthRows = attendanceMonthRes.data ?? [];
  const byStaff = new Map<string, { check_in_at: string }[]>();
  for (const row of monthRows) {
    if (!row.staff_id) continue;
    const list = byStaff.get(row.staff_id) ?? [];
    list.push({ check_in_at: row.check_in_at });
    byStaff.set(row.staff_id, list);
  }

  const clockedInIds = new Set(
    (attendanceTodayRes.data ?? [])
      .map((r) => r.staff_id)
      .filter(Boolean),
  );

  const items: StaffListItem[] = staffRows.map((row) => {
    const att = byStaff.get(row.id) ?? [];
    const sortedAtt = [...att].sort(
      (a, b) =>
        new Date(b.check_in_at).getTime() - new Date(a.check_in_at).getTime(),
    );

    let monthlySalary: number | null = null;
    if (opts.canViewSalary) {
      if (row.role === "owner" && Number(row.monthly_salary) === 0) {
        monthlySalary = null;
      } else {
        monthlySalary = Number(row.monthly_salary);
      }
    }

    return {
      ...row,
      monthly_salary: monthlySalary,
      attendance_days: uniqueAttendanceDays(att),
      working_days: workingDays,
      last_check_in: sortedAtt[0]?.check_in_at ?? null,
    };
  });

  const sorted = applySort(items, sort);

  let monthlyPayroll: number | null = null;
  if (opts.canViewSalary) {
    monthlyPayroll = staffRows
      .filter((s) => s.status === "active" && s.role !== "owner")
      .reduce((sum, s) => sum + Number(s.monthly_salary ?? 0), 0);
  }

  return {
    data: sorted,
    meta: {
      total: sorted.length,
      counts,
      clockedInToday: clockedInIds.size,
      monthlyPayroll,
    },
  };
}

async function fetchRoleCounts(
  supabase: SupabaseClient,
  gymId: string,
): Promise<StaffListResult["meta"]["counts"]> {
  const { data, error } = await supabase
    .from("staff")
    .select("role")
    .eq("gym_id", gymId);

  if (error) throw new Error(error.message);

  const counts = {
    all: 0,
    trainer: 0,
    cashier: 0,
    cleaner: 0,
    manager: 0,
    owner: 0,
  };

  for (const row of data ?? []) {
    counts.all += 1;
    const role = row.role as keyof typeof counts;
    if (role !== "all" && role in counts) {
      counts[role] += 1;
    }
  }

  return counts;
}

export async function fetchStaffById(
  supabase: SupabaseClient,
  gymId: string,
  id: string,
  opts: { canViewSalary: boolean } = { canViewSalary: false },
): Promise<StaffProfile | null> {
  const { data: staff, error } = await supabase
    .from("staff")
    .select("*")
    .eq("gym_id", gymId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!staff) return null;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const monthStart = startOfMonth();
  const now = new Date();
  const workingDays = countWorkingDaysInMonth(
    now.getFullYear(),
    now.getMonth(),
  );

  const [attendance30Res, attendanceMonthRes, salaryRes] = await Promise.all([
    supabase
      .from("attendance")
      .select("*")
      .eq("gym_id", gymId)
      .eq("staff_id", id)
      .eq("person_type", "staff")
      .gte("check_in_at", thirtyDaysAgo.toISOString())
      .order("check_in_at", { ascending: false }),
    supabase
      .from("attendance")
      .select("*")
      .eq("gym_id", gymId)
      .eq("staff_id", id)
      .eq("person_type", "staff")
      .gte("check_in_at", monthStart.toISOString())
      .order("check_in_at", { ascending: false }),
    opts.canViewSalary
      ? supabase
          .from("expenses")
          .select("*, recorder:staff!expenses_recorded_by_fkey(name)")
          .eq("gym_id", gymId)
          .eq("staff_id", id)
          .eq("category", "salary")
          .order("expense_date", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const attendance30 = (attendance30Res.data ?? []) as Attendance[];
  const attendanceMonth = (attendanceMonthRes.data ?? []) as Attendance[];

  const salaryHistory: SalaryExpenseRow[] = (
    (salaryRes.data ?? []) as (Expense & {
      recorder: { name: string } | { name: string }[] | null;
    })[]
  ).map((row) => {
    const recorder = Array.isArray(row.recorder)
      ? row.recorder[0]
      : row.recorder;
    const { recorder: _r, ...expense } = row;
    return {
      ...(expense as Expense),
      recorded_by_name: recorder?.name ?? null,
    };
  });

  const lastPaid = salaryHistory[0] ?? null;
  const lastPaidMonth = lastPaid?.salary_month ?? lastPaid?.expense_date ?? null;
  const nextDue = lastPaidMonth
    ? addMonthsIso(
        lastPaidMonth.length === 10
          ? lastPaidMonth.slice(0, 7) + "-01"
          : firstOfMonthIso(new Date(lastPaidMonth)),
        1,
      )
    : firstOfMonthIso();

  let monthlySalary: number | null = null;
  let commissionRate: number | null = null;
  if (opts.canViewSalary) {
    monthlySalary =
      staff.role === "owner" && Number(staff.monthly_salary) === 0
        ? null
        : Number(staff.monthly_salary);
    commissionRate = Number(staff.commission_rate);
  }

  const lastCheckIn = attendance30[0]?.check_in_at ?? null;

  return {
    ...(staff as Staff),
    monthly_salary: monthlySalary,
    commission_rate: commissionRate,
    attendance_30d: attendance30,
    attendance_month: attendanceMonth,
    check_in_streak: computeStreak(attendance30),
    last_check_in: lastCheckIn,
    salary_history: salaryHistory,
    last_paid_at: lastPaid?.expense_date ?? null,
    last_paid_method: lastPaid?.payment_method ?? null,
    next_due_at: opts.canViewSalary ? nextDue : null,
    notes_list: parseMemberNotes(staff.notes),
    working_days: workingDays,
    attendance_days_month: uniqueAttendanceDays(attendanceMonth),
  };
}
