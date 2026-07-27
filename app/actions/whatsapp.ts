"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getActionContext } from "@/lib/auth/get-action-context";
import { canSendReminder } from "@/lib/auth/permissions";
import { fetchFeeDueForReminder } from "@/lib/fees/queries";
import { formatAmountOnly, formatCurrency, formatShortDate } from "@/lib/members/format";
import {
  buildTemplateMessageBody,
  isWhatsAppConfigured,
  normalizeWhatsAppNumber,
  sendWhatsAppMessage,
  type WhatsAppTemplateName,
} from "@/lib/whatsapp/cloud";
import {
  buildWaMeUrl,
  fillTemplate,
  WHATSAPP_MESSAGE_TEMPLATES,
} from "@/lib/whatsapp/deeplink";
import {
  DEFAULT_REMINDER_SCHEDULE,
  type BulkReminderFilter,
  type ReminderScheduleSettings,
} from "@/lib/whatsapp/schedule";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function daysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const diff = Math.floor(
    (todayDay.getTime() - dueDay.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(0, diff);
}

function unwrapMember(
  members: unknown,
): { name: string; whatsapp: string | null; phone: string | null } | null {
  const raw = Array.isArray(members) ? members[0] : members;
  if (!raw || typeof raw !== "object") return null;
  const m = raw as {
    name?: string;
    whatsapp?: string | null;
    phone?: string | null;
  };
  if (!m.name) return null;
  return {
    name: m.name,
    whatsapp: m.whatsapp ?? null,
    phone: m.phone ?? null,
  };
}

async function getGymNameAndCurrency(
  supabase: SupabaseClient,
  gymId: string,
): Promise<{ name: string; currency: string }> {
  const { data } = await supabase
    .from("gyms")
    .select("name, currency_symbol")
    .eq("id", gymId)
    .maybeSingle();
  return {
    name: data?.name ?? "Your Gym",
    currency: data?.currency_symbol ?? "Rs.",
  };
}

export type DeeplinkResult = {
  data: { url: string; memberName: string } | null;
  error: string | null;
};

export type BulkDeeplinkItem = {
  feeDueId: string;
  url: string;
  memberName: string;
};

export async function getWhatsAppStatus(): Promise<{ configured: boolean }> {
  return { configured: isWhatsAppConfigured() };
}

export async function updateReminderSchedule(
  settings: Partial<ReminderScheduleSettings>,
): Promise<{ error: string | null }> {
  const ctx = await getActionContext({ includeStaff: true });
  if (!ctx) return { error: "Not authenticated" };
  if (ctx.role !== "owner" && ctx.role !== "manager") {
    return { error: "Only owners and managers can update reminder settings" };
  }

  const next: ReminderScheduleSettings = {
    days_before_due:
      settings.days_before_due ?? DEFAULT_REMINDER_SCHEDULE.days_before_due,
    on_due_date: settings.on_due_date ?? DEFAULT_REMINDER_SCHEDULE.on_due_date,
    overdue_every_days:
      settings.overdue_every_days ??
      DEFAULT_REMINDER_SCHEDULE.overdue_every_days,
    max_per_due: settings.max_per_due ?? DEFAULT_REMINDER_SCHEDULE.max_per_due,
  };

  if (next.days_before_due < 0 || next.days_before_due > 30) {
    return { error: "days_before_due must be between 0 and 30" };
  }
  if (next.overdue_every_days < 1 || next.overdue_every_days > 30) {
    return { error: "overdue_every_days must be between 1 and 30" };
  }
  if (next.max_per_due < 1 || next.max_per_due > 20) {
    return { error: "max_per_due must be between 1 and 20" };
  }

  const { supabase } = ctx;
  const { data: gym } = await supabase
    .from("gyms")
    .select("settings")
    .eq("id", ctx.gymId)
    .maybeSingle();

  const existing =
    gym?.settings && typeof gym.settings === "object" && !Array.isArray(gym.settings)
      ? (gym.settings as Record<string, unknown>)
      : {};

  const { error } = await supabase
    .from("gyms")
    .update({
      settings: {
        ...existing,
        reminders: next,
      },
    })
    .eq("id", ctx.gymId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { error: null };
}

/** Prepare a wa.me deep link for a fee reminder (no Cloud API). */
export async function prepareFeeReminderDeeplink(
  feeDueId: string,
): Promise<DeeplinkResult> {
  const ctx = await getActionContext({ includeStaff: true });
  if (!ctx) return { data: null, error: "Not authenticated" };
  if (!canSendReminder(ctx.role)) {
    return {
      data: null,
      error: "You do not have permission to send reminders",
    };
  }

  const { supabase } = ctx;
  const due = await fetchFeeDueForReminder(supabase, ctx.gymId, feeDueId);
  if (!due) return { data: null, error: "Fee due not found" };

  if (due.status === "paid" || due.status === "waived") {
    return { data: null, error: "This fee does not need a reminder" };
  }

  const member = unwrapMember(due.members);
  if (!member) return { data: null, error: "Member not found" };

  const contact = member.whatsapp || member.phone;
  if (!contact || !normalizeWhatsAppNumber(contact)) {
    return {
      data: null,
      error: `No WhatsApp number on file for ${member.name}. Add it in their profile.`,
    };
  }

  const { name: gymName, currency } = await getGymNameAndCurrency(
    supabase,
    ctx.gymId,
  );
  const balance = Number(due.amount_due) - Number(due.amount_paid ?? 0);
  const amount = formatAmountOnly(balance);
  const isOverdue = due.status === "overdue";

  const message = isOverdue
    ? fillTemplate(WHATSAPP_MESSAGE_TEMPLATES.OVERDUE, {
        name: member.name,
        currency: `${currency} `,
        amount,
        days: daysOverdue(due.due_date),
        gym_name: gymName,
      })
    : fillTemplate(WHATSAPP_MESSAGE_TEMPLATES.DUE_SOON, {
        name: member.name,
        currency: `${currency} `,
        amount,
        date: formatShortDate(due.due_date),
        gym_name: gymName,
      });

  const url = buildWaMeUrl(contact, message);
  if (!url) {
    return {
      data: null,
      error: `No WhatsApp number on file for ${member.name}. Add it in their profile.`,
    };
  }

  const { error: reminderError } = await supabase.from("reminders").insert({
    gym_id: ctx.gymId,
    member_id: due.member_id,
    fee_due_id: due.id,
    channel: "whatsapp",
    template: "manual_deeplink",
    message_body: message,
    status: "sent",
    external_id: null,
    sent_at: new Date().toISOString(),
  });

  if (reminderError) return { data: null, error: reminderError.message };

  await supabase
    .from("fee_dues")
    .update({
      last_reminder_sent_at: new Date().toISOString(),
      reminder_count: (due.reminder_count ?? 0) + 1,
    })
    .eq("id", feeDueId)
    .eq("gym_id", ctx.gymId);

  revalidatePath("/dashboard/fees");
  revalidatePath(`/dashboard/members/${due.member_id}`);
  revalidatePath("/dashboard");

  return { data: { url, memberName: member.name }, error: null };
}

/** Prepare a wa.me deep link for a payment receipt (no Cloud API). */
export async function preparePaymentReceiptDeeplink(
  paymentId: string,
): Promise<DeeplinkResult> {
  const ctx = await getActionContext({ includeStaff: true });
  if (!ctx) return { data: null, error: "Not authenticated" };
  if (!canSendReminder(ctx.role)) {
    return {
      data: null,
      error: "You do not have permission to send receipts",
    };
  }

  const { supabase } = ctx;
  const { data: payment, error: payError } = await supabase
    .from("payments")
    .select(
      `
      id, member_id, amount, covers_from, covers_to, receipt_sent,
      members!inner(name, whatsapp, phone, membership_end)
    `,
    )
    .eq("gym_id", ctx.gymId)
    .eq("id", paymentId)
    .maybeSingle();

  if (payError) return { data: null, error: payError.message };
  if (!payment) return { data: null, error: "Payment not found" };

  const member = unwrapMember(payment.members);
  if (!member) return { data: null, error: "Member not found" };

  const memberJoined = payment.members;
  const memberRaw = Array.isArray(memberJoined)
    ? memberJoined[0]
    : memberJoined;
  const membershipEnd =
    memberRaw && typeof memberRaw === "object"
      ? ((memberRaw as { membership_end?: string | null }).membership_end ??
        null)
      : null;

  const contact = member.whatsapp || member.phone;
  if (!contact || !normalizeWhatsAppNumber(contact)) {
    return {
      data: null,
      error: `No WhatsApp number on file for ${member.name}. Add it in their profile.`,
    };
  }

  const { name: gymName, currency } = await getGymNameAndCurrency(
    supabase,
    ctx.gymId,
  );
  const amount = formatAmountOnly(Number(payment.amount));

  const period =
    payment.covers_from && payment.covers_to
      ? `${formatShortDate(payment.covers_from)} – ${formatShortDate(payment.covers_to)}`
      : "membership";

  const expiry = formatShortDate(
    payment.covers_to ?? membershipEnd ?? payment.covers_from,
  );

  const message = fillTemplate(WHATSAPP_MESSAGE_TEMPLATES.RECEIPT, {
    name: member.name,
    currency: `${currency} `,
    amount,
    period,
    expiry,
    gym_name: gymName,
  });

  const url = buildWaMeUrl(contact, message);
  if (!url) {
    return {
      data: null,
      error: `No WhatsApp number on file for ${member.name}. Add it in their profile.`,
    };
  }

  const { error: reminderError } = await supabase.from("reminders").insert({
    gym_id: ctx.gymId,
    member_id: payment.member_id,
    fee_due_id: null,
    channel: "whatsapp",
    template: "manual_deeplink",
    message_body: message,
    status: "sent",
    external_id: null,
    sent_at: new Date().toISOString(),
  });

  if (reminderError) return { data: null, error: reminderError.message };

  await supabase
    .from("payments")
    .update({ receipt_sent: true })
    .eq("id", paymentId)
    .eq("gym_id", ctx.gymId);

  revalidatePath("/dashboard/fees");
  revalidatePath(`/dashboard/members/${payment.member_id}`);

  return { data: { url, memberName: member.name }, error: null };
}

/** Resolve fee due IDs and prepare wa.me links for each (client opens with delay). */
export async function prepareBulkReminderDeeplinks(
  filter: BulkReminderFilter,
): Promise<{
  data: BulkDeeplinkItem[];
  skipped_no_whatsapp: number;
  error: string | null;
}> {
  const empty = {
    data: [] as BulkDeeplinkItem[],
    skipped_no_whatsapp: 0,
    error: null as string | null,
  };

  const ctx = await getActionContext({ includeStaff: true });
  if (!ctx) {
    return { ...empty, error: "Not authenticated" };
  }
  if (!canSendReminder(ctx.role)) {
    return {
      ...empty,
      error: "You do not have permission to send reminders",
    };
  }

  const { supabase } = ctx;
  let feeDueIds: string[] = [];

  if (typeof filter === "object" && "ids" in filter) {
    feeDueIds = filter.ids;
  } else if (filter === "overdue") {
    const { data, error } = await supabase
      .from("fee_dues")
      .select("id")
      .eq("gym_id", ctx.gymId)
      .eq("status", "overdue");
    if (error) return { ...empty, error: error.message };
    feeDueIds = (data ?? []).map((r) => r.id);
  } else {
    const { data: gym } = await supabase
      .from("gyms")
      .select("settings")
      .eq("id", ctx.gymId)
      .maybeSingle();

    const settingsRaw =
      gym?.settings &&
      typeof gym.settings === "object" &&
      !Array.isArray(gym.settings)
        ? (gym.settings as Record<string, unknown>).reminders
        : null;
    const daysBefore =
      settingsRaw &&
      typeof settingsRaw === "object" &&
      !Array.isArray(settingsRaw) &&
      typeof (settingsRaw as ReminderScheduleSettings).days_before_due ===
        "number"
        ? (settingsRaw as ReminderScheduleSettings).days_before_due
        : DEFAULT_REMINDER_SCHEDULE.days_before_due;

    const today = new Date();
    const until = new Date(today);
    until.setDate(until.getDate() + daysBefore);
    const todayStr = today.toISOString().slice(0, 10);
    const untilStr = until.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("fee_dues")
      .select("id")
      .eq("gym_id", ctx.gymId)
      .in("status", ["pending", "partial"])
      .gte("due_date", todayStr)
      .lte("due_date", untilStr);

    if (error) return { ...empty, error: error.message };
    feeDueIds = (data ?? []).map((r) => r.id);
  }

  if (feeDueIds.length === 0) {
    return empty;
  }

  const [{ name: gymName, currency }, duesResult] = await Promise.all([
    getGymNameAndCurrency(supabase, ctx.gymId),
    supabase
      .from("fee_dues")
      .select(
        `
        id, member_id, amount_due, amount_paid, due_date, status, reminder_count,
        members!inner(name, whatsapp, phone)
      `,
      )
      .eq("gym_id", ctx.gymId)
      .in("id", feeDueIds)
      .not("status", "in", '("paid","waived")'),
  ]);

  if (duesResult.error) {
    return { ...empty, error: duesResult.error.message };
  }

  const items: BulkDeeplinkItem[] = [];
  let skipped_no_whatsapp = 0;
  const reminderRows: Array<Record<string, unknown>> = [];
  const dueUpdates: Array<{ id: string; reminder_count: number }> = [];
  const sentAt = new Date().toISOString();

  for (const due of duesResult.data ?? []) {
    const member = unwrapMember(due.members);
    if (!member) continue;

    const contact = member.whatsapp || member.phone;
    if (!contact || !normalizeWhatsAppNumber(contact)) {
      skipped_no_whatsapp += 1;
      continue;
    }

    const balance = Number(due.amount_due) - Number(due.amount_paid ?? 0);
    const amount = formatAmountOnly(balance);
    const isOverdue = due.status === "overdue";

    const message = isOverdue
      ? fillTemplate(WHATSAPP_MESSAGE_TEMPLATES.OVERDUE, {
          name: member.name,
          currency: `${currency} `,
          amount,
          days: daysOverdue(due.due_date),
          gym_name: gymName,
        })
      : fillTemplate(WHATSAPP_MESSAGE_TEMPLATES.DUE_SOON, {
          name: member.name,
          currency: `${currency} `,
          amount,
          date: formatShortDate(due.due_date),
          gym_name: gymName,
        });

    const url = buildWaMeUrl(contact, message);
    if (!url) {
      skipped_no_whatsapp += 1;
      continue;
    }

    reminderRows.push({
      gym_id: ctx.gymId,
      member_id: due.member_id,
      fee_due_id: due.id,
      channel: "whatsapp",
      template: "manual_deeplink",
      message_body: message,
      status: "sent",
      external_id: null,
      sent_at: sentAt,
    });

    dueUpdates.push({
      id: due.id,
      reminder_count: (due.reminder_count ?? 0) + 1,
    });

    items.push({
      feeDueId: due.id,
      url,
      memberName: member.name,
    });
  }

  if (reminderRows.length > 0) {
    const { error: reminderError } = await supabase
      .from("reminders")
      .insert(reminderRows);
    if (reminderError) {
      return { ...empty, error: reminderError.message };
    }

    await Promise.all(
      dueUpdates.map((u) =>
        supabase
          .from("fee_dues")
          .update({
            last_reminder_sent_at: sentAt,
            reminder_count: u.reminder_count,
          })
          .eq("id", u.id)
          .eq("gym_id", ctx.gymId),
      ),
    );
  }

  revalidatePath("/dashboard/fees");
  revalidatePath("/dashboard");

  return { data: items, skipped_no_whatsapp, error: null };
}

/** Cloud API send — used by cron / auto-receipt when credentials exist. */
export async function sendFeeReminder(
  feeDueId: string,
): Promise<{ error: string | null }> {
  const ctx = await getActionContext({ includeStaff: true });
  if (!ctx) return { error: "Not authenticated" };
  if (!canSendReminder(ctx.role)) {
    return { error: "You do not have permission to send reminders" };
  }

  if (!isWhatsAppConfigured()) {
    return {
      error:
        "WhatsApp is not configured. Add WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID.",
    };
  }

  const { supabase } = ctx;
  const due = await fetchFeeDueForReminder(supabase, ctx.gymId, feeDueId);
  if (!due) return { error: "Fee due not found" };

  if (due.status === "paid" || due.status === "waived") {
    return { error: "This fee does not need a reminder" };
  }

  const member = unwrapMember(due.members);
  if (!member) return { error: "Member not found" };

  const contact = member.whatsapp || member.phone;
  if (!contact || !normalizeWhatsAppNumber(contact)) {
    return { error: "Member has no WhatsApp or phone number on file" };
  }

  const { name: gymName, currency } = await getGymNameAndCurrency(
    supabase,
    ctx.gymId,
  );
  const balance = Number(due.amount_due) - Number(due.amount_paid ?? 0);
  const amountStr = formatCurrency(balance, currency);

  const isOverdue = due.status === "overdue";
  const template: WhatsAppTemplateName = isOverdue
    ? "fee_reminder_overdue"
    : "fee_reminder_before_due";

  const params = isOverdue
    ? [
        member.name,
        amountStr,
        String(daysOverdue(due.due_date)),
        gymName,
      ]
    : [member.name, amountStr, formatShortDate(due.due_date), gymName];

  const messageBody = buildTemplateMessageBody(template, params);
  const result = await sendWhatsAppMessage(contact, template, params);

  const { error: reminderError } = await supabase.from("reminders").insert({
    gym_id: ctx.gymId,
    member_id: due.member_id,
    fee_due_id: due.id,
    channel: "whatsapp",
    template,
    message_body: messageBody,
    status: result.success ? "sent" : "failed",
    external_id: result.messageId ?? null,
    sent_at: new Date().toISOString(),
  });

  if (reminderError) return { error: reminderError.message };

  if (!result.success) {
    return { error: result.error ?? "Failed to send WhatsApp reminder" };
  }

  await supabase
    .from("fee_dues")
    .update({
      last_reminder_sent_at: new Date().toISOString(),
      reminder_count: (due.reminder_count ?? 0) + 1,
    })
    .eq("id", feeDueId)
    .eq("gym_id", ctx.gymId);

  revalidatePath("/dashboard/fees");
  revalidatePath(`/dashboard/members/${due.member_id}`);
  revalidatePath("/dashboard");

  return { error: null };
}

export async function sendPaymentReceipt(
  paymentId: string,
): Promise<{ error: string | null }> {
  const ctx = await getActionContext({ includeStaff: true });
  if (!ctx) return { error: "Not authenticated" };
  if (!canSendReminder(ctx.role)) {
    return { error: "You do not have permission to send receipts" };
  }

  if (!isWhatsAppConfigured()) {
    return {
      error:
        "WhatsApp is not configured. Add WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID.",
    };
  }

  const { supabase } = ctx;
  const { data: payment, error: payError } = await supabase
    .from("payments")
    .select(
      `
      id, member_id, amount, covers_from, covers_to, receipt_sent,
      members!inner(name, whatsapp, phone, membership_end)
    `,
    )
    .eq("gym_id", ctx.gymId)
    .eq("id", paymentId)
    .maybeSingle();

  if (payError) return { error: payError.message };
  if (!payment) return { error: "Payment not found" };

  const member = unwrapMember(payment.members);
  if (!member) return { error: "Member not found" };

  const memberJoined = payment.members;
  const memberRaw = Array.isArray(memberJoined)
    ? memberJoined[0]
    : memberJoined;
  const membershipEnd =
    memberRaw && typeof memberRaw === "object"
      ? ((memberRaw as { membership_end?: string | null }).membership_end ??
        null)
      : null;

  const contact = member.whatsapp || member.phone;
  if (!contact || !normalizeWhatsAppNumber(contact)) {
    return { error: "Member has no WhatsApp or phone number on file" };
  }

  const { name: gymName, currency } = await getGymNameAndCurrency(
    supabase,
    ctx.gymId,
  );
  const amountStr = formatCurrency(Number(payment.amount), currency);

  const period =
    payment.covers_from && payment.covers_to
      ? `${formatShortDate(payment.covers_from)} – ${formatShortDate(payment.covers_to)}`
      : "membership";

  const expiry = formatShortDate(
    payment.covers_to ?? membershipEnd ?? payment.covers_from,
  );

  const template: WhatsAppTemplateName = "payment_receipt";
  const params = [member.name, amountStr, period, expiry, gymName];
  const messageBody = buildTemplateMessageBody(template, params);
  const result = await sendWhatsAppMessage(contact, template, params);

  const { error: reminderError } = await supabase.from("reminders").insert({
    gym_id: ctx.gymId,
    member_id: payment.member_id,
    fee_due_id: null,
    channel: "whatsapp",
    template,
    message_body: messageBody,
    status: result.success ? "sent" : "failed",
    external_id: result.messageId ?? null,
    sent_at: new Date().toISOString(),
  });

  if (reminderError) return { error: reminderError.message };

  if (!result.success) {
    return { error: result.error ?? "Failed to send payment receipt" };
  }

  await supabase
    .from("payments")
    .update({ receipt_sent: true })
    .eq("id", paymentId)
    .eq("gym_id", ctx.gymId);

  revalidatePath("/dashboard/fees");
  revalidatePath(`/dashboard/members/${payment.member_id}`);

  return { error: null };
}

export async function sendWelcomeNewMember(
  memberId: string,
): Promise<{ error: string | null }> {
  const ctx = await getActionContext({ includeStaff: true });
  if (!ctx) return { error: "Not authenticated" };

  if (!isWhatsAppConfigured()) {
    return {
      error:
        "WhatsApp is not configured. Add WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID.",
    };
  }

  const { supabase } = ctx;
  const { data: member, error } = await supabase
    .from("members")
    .select("id, name, member_code, whatsapp, phone")
    .eq("gym_id", ctx.gymId)
    .eq("id", memberId)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!member) return { error: "Member not found" };

  const contact = member.whatsapp || member.phone;
  if (!contact || !normalizeWhatsAppNumber(contact)) {
    return { error: "Member has no WhatsApp or phone number on file" };
  }

  const { name: gymName } = await getGymNameAndCurrency(supabase, ctx.gymId);
  const template: WhatsAppTemplateName = "welcome_new_member";
  const params = [gymName, member.name, member.member_code ?? member.id];
  const messageBody = buildTemplateMessageBody(template, params);
  const result = await sendWhatsAppMessage(contact, template, params);

  await supabase.from("reminders").insert({
    gym_id: ctx.gymId,
    member_id: member.id,
    fee_due_id: null,
    channel: "whatsapp",
    template,
    message_body: messageBody,
    status: result.success ? "sent" : "failed",
    external_id: result.messageId ?? null,
    sent_at: new Date().toISOString(),
  });

  if (!result.success) {
    return { error: result.error ?? "Failed to send welcome message" };
  }

  return { error: null };
}

export async function sendBulkReminders(
  filter: BulkReminderFilter,
): Promise<{
  sent: number;
  failed: number;
  skipped_no_whatsapp: number;
  error: string | null;
}> {
  const empty = {
    sent: 0,
    failed: 0,
    skipped_no_whatsapp: 0,
    error: null as string | null,
  };

  const ctx = await getActionContext({ includeStaff: true });
  if (!ctx) {
    return { ...empty, error: "Not authenticated" };
  }
  if (!canSendReminder(ctx.role)) {
    return {
      ...empty,
      error: "You do not have permission to send reminders",
    };
  }

  if (!isWhatsAppConfigured()) {
    return {
      ...empty,
      error:
        "WhatsApp is not configured. Add WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID.",
    };
  }

  const { supabase } = ctx;
  let feeDueIds: string[] = [];

  if (typeof filter === "object" && "ids" in filter) {
    feeDueIds = filter.ids;
  } else if (filter === "overdue") {
    const { data, error } = await supabase
      .from("fee_dues")
      .select("id")
      .eq("gym_id", ctx.gymId)
      .eq("status", "overdue");
    if (error) return { ...empty, error: error.message };
    feeDueIds = (data ?? []).map((r) => r.id);
  } else {
    // due_soon: pending/partial dues within days_before_due of due date
    const { data: gym } = await supabase
      .from("gyms")
      .select("settings")
      .eq("id", ctx.gymId)
      .maybeSingle();

    const settingsRaw =
      gym?.settings &&
      typeof gym.settings === "object" &&
      !Array.isArray(gym.settings)
        ? (gym.settings as Record<string, unknown>).reminders
        : null;
    const daysBefore =
      settingsRaw &&
      typeof settingsRaw === "object" &&
      !Array.isArray(settingsRaw) &&
      typeof (settingsRaw as ReminderScheduleSettings).days_before_due ===
        "number"
        ? (settingsRaw as ReminderScheduleSettings).days_before_due
        : DEFAULT_REMINDER_SCHEDULE.days_before_due;

    const today = new Date();
    const until = new Date(today);
    until.setDate(until.getDate() + daysBefore);
    const todayStr = today.toISOString().slice(0, 10);
    const untilStr = until.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("fee_dues")
      .select("id")
      .eq("gym_id", ctx.gymId)
      .in("status", ["pending", "partial"])
      .gte("due_date", todayStr)
      .lte("due_date", untilStr);

    if (error) return { ...empty, error: error.message };
    feeDueIds = (data ?? []).map((r) => r.id);
  }

  if (feeDueIds.length === 0) {
    return { ...empty, error: null };
  }

  let sent = 0;
  let failed = 0;
  let skipped_no_whatsapp = 0;

  for (let i = 0; i < feeDueIds.length; i++) {
    const id = feeDueIds[i]!;
    const result = await sendFeeReminder(id);

    if (result.error?.includes("no WhatsApp") || result.error?.includes("no WhatsApp or phone")) {
      skipped_no_whatsapp += 1;
    } else if (result.error) {
      failed += 1;
    } else {
      sent += 1;
    }

    if (i < feeDueIds.length - 1) {
      await sleep(1000);
    }
  }

  revalidatePath("/dashboard/fees");
  revalidatePath("/dashboard");

  return { sent, failed, skipped_no_whatsapp, error: null };
}
