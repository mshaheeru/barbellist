"use server";

import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit/log-action";
import {
  fetchAttendanceFeed,
  fetchAttendanceFeedItemById,
  fetchAttendanceSidebarStats,
  fetchLiveGymCounts,
  performMemberCheckIn,
  performStaffCheckIn,
  searchMembersForCheckIn,
} from "@/lib/attendance/queries";
import {
  formatLongDateInTimezone,
  getGymTimezone,
} from "@/lib/attendance/timezone";
import { canCheckIn, canCheckInSelf } from "@/lib/auth/permissions";
import { QrTokenError, verifyMemberQrToken } from "@/lib/qr/verify-member-token";
import { createClient } from "@/lib/supabase/server";
import type {
  AttendanceFeedPayload,
  CheckInResult,
  LiveGymCounts,
  StaffRole,
} from "@/lib/types";
import {
  attendanceFeedFilterSchema,
  checkInByQrTokenSchema,
  checkInMemberSchema,
  checkInStaffSchema,
  kioskSearchSchema,
} from "@/lib/validations/attendance";

async function getAuthenticatedContext(): Promise<{
  gymId: string;
  userId: string;
  role: StaffRole | null;
  staffId: string | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const gymId = user?.user_metadata?.gym_id as string | undefined;
  if (!gymId || !user) return null;

  const role = (user.user_metadata?.role as StaffRole | undefined) ?? null;

  const { data: staffRow } = await supabase
    .from("staff")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return {
    gymId,
    userId: user.id,
    role,
    staffId: staffRow?.id ?? null,
  };
}

export async function getAttendanceFeedPage(
  raw: { date_range?: string; person_filter?: string } = {},
): Promise<{ data: AttendanceFeedPayload | null; error: string | null }> {
  try {
    const ctx = await getAuthenticatedContext();
    if (!ctx) return { data: null, error: "Not authenticated" };

    const parsed = attendanceFeedFilterSchema.safeParse({
      date_range: raw.date_range ?? "today",
      person_filter: raw.person_filter ?? "all",
    });
    const filters = parsed.success
      ? parsed.data
      : { date_range: "today" as const, person_filter: "all" as const };

    const supabase = await createClient();

    const { data: gymRow } = await supabase
      .from("gyms")
      .select("timezone")
      .eq("id", ctx.gymId)
      .maybeSingle();

    const timeZone = getGymTimezone(gymRow?.timezone);

    const [feed, liveCounts, sidebar] = await Promise.all([
      fetchAttendanceFeed(
        supabase,
        ctx.gymId,
        filters.date_range,
        filters.person_filter,
      ),
      fetchLiveGymCounts(supabase, ctx.gymId),
      fetchAttendanceSidebarStats(supabase, ctx.gymId, filters.date_range),
    ]);

    return {
      data: {
        feed,
        liveCounts,
        sidebar,
        timeZone,
        dateLabel: formatLongDateInTimezone(new Date(), timeZone),
      },
      error: null,
    };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load attendance",
    };
  }
}

export async function getLiveGymCounts(): Promise<{
  data: LiveGymCounts | null;
  error: string | null;
}> {
  try {
    const ctx = await getAuthenticatedContext();
    if (!ctx) return { data: null, error: "Not authenticated" };

    const supabase = await createClient();
    const data = await fetchLiveGymCounts(supabase, ctx.gymId);
    return { data, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load live counts",
    };
  }
}

export async function getAttendanceFeedItem(
  id: string,
): Promise<{ data: import("@/lib/types").AttendanceFeedItem | null; error: string | null }> {
  try {
    const ctx = await getAuthenticatedContext();
    if (!ctx) return { data: null, error: "Not authenticated" };

    const supabase = await createClient();
    const data = await fetchAttendanceFeedItemById(supabase, ctx.gymId, id);
    return { data, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load record",
    };
  }
}

export async function checkInMember(raw: {
  member_id: string;
  method: "qr" | "fingerprint" | "manual";
}): Promise<{ data: CheckInResult | null; error: string | null }> {
  try {
    const ctx = await getAuthenticatedContext();
    if (!ctx) return { data: null, error: "Not authenticated" };
    if (!canCheckIn(ctx.role)) {
      return { data: null, error: "You do not have permission to check in members" };
    }

    const parsed = checkInMemberSchema.safeParse(raw);
    if (!parsed.success) {
      return { data: null, error: "Invalid check-in request" };
    }

    const supabase = await createClient();
    const { result, deduped } = await performMemberCheckIn(
      supabase,
      ctx.gymId,
      parsed.data.member_id,
      parsed.data.method,
    );

    if (!deduped) {
      await logAuditAction(supabase, {
        gymId: ctx.gymId,
        actorStaffId: ctx.staffId,
        action: "member_check_in",
        entityType: "attendance",
        entityId: result.attendance_id,
        details: {
          member_id: parsed.data.member_id,
          method: parsed.data.method,
          fee_snapshot: result.fee_snapshot,
        },
      });
    }

    revalidatePath("/dashboard/attendance");
    return { data: result, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Check-in failed",
    };
  }
}

export async function checkInStaff(raw: {
  staff_id: string;
  method: "qr" | "fingerprint" | "manual";
}): Promise<{ data: { id: string } | null; error: string | null }> {
  try {
    const ctx = await getAuthenticatedContext();
    if (!ctx) return { data: null, error: "Not authenticated" };

    const isSelf = ctx.staffId === raw.staff_id;
    const allowed =
      canCheckIn(ctx.role) || (isSelf && canCheckInSelf(ctx.role));
    if (!allowed) {
      return { data: null, error: "You do not have permission to check in staff" };
    }

    const parsed = checkInStaffSchema.safeParse(raw);
    if (!parsed.success) {
      return { data: null, error: "Invalid check-in request" };
    }

    const supabase = await createClient();
    const attendance = await performStaffCheckIn(
      supabase,
      ctx.gymId,
      parsed.data.staff_id,
      parsed.data.method,
    );

    await logAuditAction(supabase, {
      gymId: ctx.gymId,
      actorStaffId: ctx.staffId,
      action: "staff_check_in",
      entityType: "attendance",
      entityId: attendance.id,
      details: { staff_id: parsed.data.staff_id, method: parsed.data.method },
    });

    revalidatePath("/dashboard/attendance");
    return { data: { id: attendance.id }, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Staff check-in failed",
    };
  }
}

export async function checkInByQrToken(raw: {
  token: string;
}): Promise<{ data: CheckInResult | null; error: string | null }> {
  try {
    const ctx = await getAuthenticatedContext();
    if (!ctx) return { data: null, error: "Not authenticated" };
    if (!canCheckIn(ctx.role)) {
      return { data: null, error: "You do not have permission to check in members" };
    }

    const parsed = checkInByQrTokenSchema.safeParse(raw);
    if (!parsed.success) {
      return { data: null, error: "Invalid QR code" };
    }

    let verified: { memberId: string; gymId: string };
    try {
      verified = await verifyMemberQrToken(parsed.data.token);
    } catch (e) {
      const message =
        e instanceof QrTokenError ? e.message : "Invalid QR code";
      return { data: null, error: message };
    }

    if (verified.gymId !== ctx.gymId) {
      return { data: null, error: "This card belongs to another gym" };
    }

    const supabase = await createClient();
    const { data: member } = await supabase
      .from("members")
      .select("id, card_qr_token")
      .eq("gym_id", ctx.gymId)
      .eq("id", verified.memberId)
      .maybeSingle();

    if (!member) {
      return { data: null, error: "Member not found" };
    }

    if (member.card_qr_token !== parsed.data.token) {
      return { data: null, error: "This QR code has been replaced. Use the latest card." };
    }

    return checkInMember({
      member_id: verified.memberId,
      method: "qr",
    });
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "QR check-in failed",
    };
  }
}

export async function searchMembersForKiosk(raw: {
  query: string;
}): Promise<{
  data: Awaited<ReturnType<typeof searchMembersForCheckIn>> | null;
  error: string | null;
}> {
  try {
    const ctx = await getAuthenticatedContext();
    if (!ctx) return { data: null, error: "Not authenticated" };
    if (!canCheckIn(ctx.role)) {
      return { data: null, error: "You do not have permission to check in members" };
    }

    const parsed = kioskSearchSchema.safeParse(raw);
    if (!parsed.success) {
      return { data: [], error: null };
    }

    const supabase = await createClient();
    const data = await searchMembersForCheckIn(
      supabase,
      ctx.gymId,
      parsed.data.query,
    );
    return { data, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Search failed",
    };
  }
}
