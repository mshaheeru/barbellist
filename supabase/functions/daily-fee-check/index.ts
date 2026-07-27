/**
 * daily-fee-check — Supabase Edge Function (cron daily)
 *
 * For each gym:
 *  1. Generate fee_dues for the current month (if missing)
 *  2. Mark pending/partial past due_date as overdue
 *  3. Send WhatsApp reminders matching gym reminder schedule settings
 *
 * Auth: verify_jwt=false; protect with Authorization Bearer = service role
 * or CRON_SECRET header. Configure daily cron in Supabase Dashboard.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const DEFAULT_REMINDERS = {
  days_before_due: 3,
  on_due_date: true,
  overdue_every_days: 3,
  max_per_due: 5,
};

type ReminderSchedule = typeof DEFAULT_REMINDERS;

function firstOfMonth(d = new Date()): string {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  const aDay = new Date(da.getFullYear(), da.getMonth(), da.getDate());
  const bDay = new Date(db.getFullYear(), db.getMonth(), db.getDate());
  return Math.floor(
    (bDay.getTime() - aDay.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function parseReminders(settings: unknown): ReminderSchedule {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return { ...DEFAULT_REMINDERS };
  }
  const rem = (settings as Record<string, unknown>).reminders;
  if (!rem || typeof rem !== "object" || Array.isArray(rem)) {
    return { ...DEFAULT_REMINDERS };
  }
  const o = rem as Record<string, unknown>;
  return {
    days_before_due:
      typeof o.days_before_due === "number"
        ? o.days_before_due
        : DEFAULT_REMINDERS.days_before_due,
    on_due_date:
      typeof o.on_due_date === "boolean"
        ? o.on_due_date
        : DEFAULT_REMINDERS.on_due_date,
    overdue_every_days:
      typeof o.overdue_every_days === "number"
        ? o.overdue_every_days
        : DEFAULT_REMINDERS.overdue_every_days,
    max_per_due:
      typeof o.max_per_due === "number"
        ? o.max_per_due
        : DEFAULT_REMINDERS.max_per_due,
  };
}

function parseWhatsApp(settings: unknown): {
  token: string | null;
  phoneNumberId: string | null;
} {
  const envToken = Deno.env.get("WHATSAPP_API_TOKEN")?.trim() || null;
  const envPhone = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")?.trim() || null;
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return { token: envToken, phoneNumberId: envPhone };
  }
  const wa = (settings as Record<string, unknown>).whatsapp;
  if (!wa || typeof wa !== "object" || Array.isArray(wa)) {
    return { token: envToken, phoneNumberId: envPhone };
  }
  const o = wa as Record<string, unknown>;
  const token =
    (typeof o.api_token === "string" && o.api_token.trim()) || envToken;
  const phoneNumberId =
    (typeof o.phone_number_id === "string" && o.phone_number_id.trim()) ||
    envPhone;
  return { token, phoneNumberId };
}

function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0") && digits.length === 11) {
    digits = `92${digits.slice(1)}`;
  }
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

async function generateMonthlyDues(
  supabase: ReturnType<typeof createClient>,
  gymId: string,
): Promise<{ created: number; markedOverdue: number }> {
  const monthStart = firstOfMonth();
  const today = todayStr();

  const { data: members, error: membersError } = await supabase
    .from("members")
    .select("id, package_id, packages(price)")
    .eq("gym_id", gymId)
    .eq("status", "active")
    .not("package_id", "is", null);

  if (membersError) throw new Error(membersError.message);

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

    if (existingError) throw new Error(existingError.message);

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

      if (insertError) throw new Error(insertError.message);
      created = inserted?.length ?? toInsert.length;
    }
  }

  const { data: overdueCandidates, error: overdueFetchError } = await supabase
    .from("fee_dues")
    .select("id")
    .eq("gym_id", gymId)
    .in("status", ["pending", "partial"])
    .lt("due_date", today);

  if (overdueFetchError) throw new Error(overdueFetchError.message);

  const ids = (overdueCandidates ?? []).map((r) => r.id);
  let markedOverdue = 0;

  if (ids.length > 0) {
    const { data: updated, error: updateError } = await supabase
      .from("fee_dues")
      .update({ status: "overdue" })
      .eq("gym_id", gymId)
      .in("id", ids)
      .select("id");

    if (updateError) throw new Error(updateError.message);
    markedOverdue = updated?.length ?? 0;
  }

  return { created, markedOverdue };
}

async function sendWhatsApp(
  to: string,
  templateName: string,
  params: string[],
  token: string,
  phoneNumberId: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const normalized = normalizeWhatsAppNumber(to);
  if (!normalized) return { success: false, error: "Invalid number" };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalized,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: params.map((text) => ({ type: "text", text })),
            },
          ],
        },
      }),
    },
  );

  const json = (await res.json()) as {
    messages?: { id: string }[];
    error?: { message?: string };
  };

  if (!res.ok) {
    return {
      success: false,
      error: json.error?.message ?? `HTTP ${res.status}`,
    };
  }

  return { success: true, messageId: json.messages?.[0]?.id };
}

function shouldSendReminder(
  due: {
    due_date: string;
    status: string;
    reminder_count: number | null;
    last_reminder_sent_at: string | null;
  },
  schedule: ReminderSchedule,
  today: string,
): boolean {
  const count = due.reminder_count ?? 0;
  if (count >= schedule.max_per_due) return false;

  const daysToDue = daysBetween(today, due.due_date);
  const overdueDays = daysBetween(due.due_date, today);

  if (due.status === "overdue") {
    if (overdueDays <= 0) return false;
    if (count === 0) return true;
    if (!due.last_reminder_sent_at) return true;
    const daysSinceLast = daysBetween(
      due.last_reminder_sent_at.slice(0, 10),
      today,
    );
    return daysSinceLast >= schedule.overdue_every_days;
  }

  // pending / partial
  if (daysToDue === 0 && schedule.on_due_date) return count === 0;
  if (daysToDue > 0 && daysToDue <= schedule.days_before_due) {
    return count === 0;
  }
  return false;
}

async function sendScheduledReminders(
  supabase: ReturnType<typeof createClient>,
  gym: { id: string; name: string; currency_symbol: string | null; settings: unknown },
): Promise<{ sent: number; failed: number; skipped: number }> {
  const schedule = parseReminders(gym.settings);
  const { token, phoneNumberId } = parseWhatsApp(gym.settings);
  if (!token || !phoneNumberId) {
    return { sent: 0, failed: 0, skipped: 0 };
  }

  const today = todayStr();
  const until = new Date();
  until.setDate(until.getDate() + schedule.days_before_due);
  const untilStr = until.toISOString().slice(0, 10);

  const { data: dues, error } = await supabase
    .from("fee_dues")
    .select(
      `
      id, member_id, amount_due, amount_paid, due_date, status,
      reminder_count, last_reminder_sent_at,
      members!inner(name, whatsapp, phone)
    `,
    )
    .eq("gym_id", gym.id)
    .in("status", ["pending", "partial", "overdue"]);

  if (error) throw new Error(error.message);

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  const currency = gym.currency_symbol ?? "Rs.";

  for (const due of dues ?? []) {
    // Skip pending/partial beyond the before-due window (overdue always candidates)
    if (due.status !== "overdue") {
      if (due.due_date < today || due.due_date > untilStr) {
        continue;
      }
    }

    if (!shouldSendReminder(due, schedule, today)) continue;

    const memberRaw = due.members as
      | { name: string; whatsapp: string | null; phone: string | null }
      | { name: string; whatsapp: string | null; phone: string | null }[];
    const member = Array.isArray(memberRaw) ? memberRaw[0] : memberRaw;
    if (!member) {
      skipped += 1;
      continue;
    }

    const contact = member.whatsapp || member.phone;
    if (!normalizeWhatsAppNumber(contact)) {
      skipped += 1;
      continue;
    }

    const balance = Number(due.amount_due) - Number(due.amount_paid ?? 0);
    const amountStr = `${currency} ${balance.toLocaleString("en-PK")}`;
    const isOverdue = due.status === "overdue";
    const template = isOverdue
      ? "fee_reminder_overdue"
      : "fee_reminder_before_due";
    const params = isOverdue
      ? [
          member.name,
          amountStr,
          String(Math.max(0, daysBetween(due.due_date, today))),
          gym.name,
        ]
      : [member.name, amountStr, due.due_date, gym.name];

    const result = await sendWhatsApp(
      contact!,
      template,
      params,
      token,
      phoneNumberId,
    );

    await supabase.from("reminders").insert({
      gym_id: gym.id,
      member_id: due.member_id,
      fee_due_id: due.id,
      channel: "whatsapp",
      template,
      message_body: params.join(" · "),
      status: result.success ? "sent" : "failed",
      external_id: result.messageId ?? null,
      sent_at: new Date().toISOString(),
    });

    if (result.success) {
      sent += 1;
      await supabase
        .from("fee_dues")
        .update({
          last_reminder_sent_at: new Date().toISOString(),
          reminder_count: (due.reminder_count ?? 0) + 1,
        })
        .eq("id", due.id)
        .eq("gym_id", gym.id);
    } else {
      failed += 1;
    }

    // mild rate limit
    await new Promise((r) => setTimeout(r, 200));
  }

  return { sent, failed, skipped };
}

function authorize(req: Request): boolean {
  const auth = req.headers.get("Authorization") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";

  if (cronSecret && req.headers.get("x-cron-secret") === cronSecret) {
    return true;
  }
  if (serviceKey && auth === `Bearer ${serviceKey}`) {
    return true;
  }
  return false;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!authorize(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: gyms, error: gymsError } = await supabase
    .from("gyms")
    .select("id, name, currency_symbol, settings");

  if (gymsError) {
    return new Response(JSON.stringify({ error: gymsError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const results: Array<Record<string, unknown>> = [];

  for (const gym of gyms ?? []) {
    try {
      const dues = await generateMonthlyDues(supabase, gym.id);
      const reminders = await sendScheduledReminders(supabase, gym);
      results.push({
        gym_id: gym.id,
        gym_name: gym.name,
        ...dues,
        reminders,
      });
    } catch (e) {
      results.push({
        gym_id: gym.id,
        gym_name: gym.name,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      ran_at: new Date().toISOString(),
      gyms: results.length,
      results,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
