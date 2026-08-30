import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const RECIPIENT =
  process.env.AUDIT_RECIPIENT_EMAIL ?? "hello@barbellist.com";

const ATTENDANCE_OPTIONS = [
  "paper_register",
  "whatsapp",
  "spreadsheet",
  "other_software",
  "nothing",
  "other",
] as const;

const payloadSchema = z.object({
  contactName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(7).max(40),
  gymName: z.string().trim().max(160).optional().nullable(),
  activeMembers: z.coerce.number().int().min(0).max(100_000),
  averageMonthlyFee: z.coerce.number().min(0).max(10_000_000),
  currentlyOverdue: z.coerce.number().int().min(0).max(100_000),
  expireNext30Days: z.coerce.number().int().min(0).max(100_000),
  attendanceTracking: z.enum(ATTENDANCE_OPTIONS),
});

const ATTENDANCE_LABELS: Record<(typeof ATTENDANCE_OPTIONS)[number], string> = {
  paper_register: "Paper register",
  whatsapp: "WhatsApp",
  spreadsheet: "Spreadsheet",
  other_software: "Other software",
  nothing: "We don't track it",
  other: "Other",
};

/** Rough monthly revenue at risk from overdue + near-expiry renewals. */
export function estimateAtRisk(input: {
  averageMonthlyFee: number;
  currentlyOverdue: number;
  expireNext30Days: number;
}) {
  const fee = input.averageMonthlyFee;
  const overdue = input.currentlyOverdue * fee;
  // Near-expiry: assume a portion may slip without follow-up
  const expiryLow = input.expireNext30Days * fee * 0.35;
  const expiryHigh = input.expireNext30Days * fee * 0.7;
  return {
    low: Math.round(overdue + expiryLow),
    high: Math.round(overdue + expiryHigh),
  };
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  if (data.currentlyOverdue > data.activeMembers) {
    return NextResponse.json(
      { error: "Overdue members can't be more than active members." },
      { status: 400 },
    );
  }
  if (data.expireNext30Days > data.activeMembers) {
    return NextResponse.json(
      { error: "Expiring members can't be more than active members." },
      { status: 400 },
    );
  }

  const estimate = estimateAtRisk(data);
  const userAgent = request.headers.get("user-agent")?.slice(0, 400) ?? null;

  try {
    const admin = createAdminClient();
    const { error: dbError } = await admin.from("revenue_audits").insert({
      gym_name: data.gymName?.trim() || null,
      contact_name: data.contactName,
      email: data.email,
      phone: data.phone,
      active_members: data.activeMembers,
      average_monthly_fee: data.averageMonthlyFee,
      currently_overdue: data.currentlyOverdue,
      expire_next_30_days: data.expireNext30Days,
      attendance_tracking: data.attendanceTracking,
      estimated_at_risk_low: estimate.low,
      estimated_at_risk_high: estimate.high,
      user_agent: userAgent,
    });

    if (dbError) {
      console.error("[revenue-audit] insert failed", dbError.message);
      return NextResponse.json(
        { error: "Could not save your audit. Please try again." },
        { status: 500 },
      );
    }

    // Best-effort email notification (same pattern as /api/order)
    try {
      await fetch(`https://formsubmit.co/ajax/${RECIPIENT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: data.contactName,
          email: data.email,
          phone: data.phone,
          gym_name: data.gymName || "Not provided",
          active_members: data.activeMembers,
          average_monthly_fee: data.averageMonthlyFee,
          currently_overdue: data.currentlyOverdue,
          expire_next_30_days: data.expireNext30Days,
          attendance_tracking: ATTENDANCE_LABELS[data.attendanceTracking],
          estimated_at_risk: `Rs. ${estimate.low.toLocaleString("en-PK")} – Rs. ${estimate.high.toLocaleString("en-PK")}`,
          _subject: "New Barbellist revenue audit request",
          _template: "table",
          _captcha: "false",
          _replyto: data.email,
        }),
      });
    } catch (emailErr) {
      console.error("[revenue-audit] email notify failed", emailErr);
      // Still return success — lead is saved in DB
    }

    return NextResponse.json({
      data: {
        estimatedAtRiskLow: estimate.low,
        estimatedAtRiskHigh: estimate.high,
      },
    });
  } catch (err) {
    console.error("[revenue-audit]", err);
    return NextResponse.json(
      { error: "Could not save your audit. Please try again." },
      { status: 500 },
    );
  }
}
