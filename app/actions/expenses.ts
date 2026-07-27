"use server";

import { revalidatePath } from "next/cache";
import { getActionContextWithStaff } from "@/lib/auth/get-action-context";
import {
  canManageExpenses,
  canRecordExpense,
  canRecordSalary,
} from "@/lib/auth/permissions";
import { logAuditAction } from "@/lib/audit/log-action";
import {
  fetchExpensesOverview,
  type ExpensesListParams,
} from "@/lib/expenses/queries";
import { normalizeSalaryMonth } from "@/lib/expenses/format";
import {
  createExpenseSchema,
  updateExpenseSchema,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from "@/lib/validations/expenses";
import type { ExpensesListResult } from "@/lib/types";

function revalidateExpenses(staffId?: string | null) {
  revalidatePath("/dashboard/expenses");
  if (staffId) revalidatePath(`/dashboard/staff/${staffId}`);
  revalidatePath("/dashboard/staff");
}

export async function getExpenses(
  params: ExpensesListParams = {},
): Promise<{ data: ExpensesListResult | null; error: string | null }> {
  try {
    const ctx = await getActionContextWithStaff();
    if (!ctx) return { data: null, error: "Not authenticated" };
    if (!canManageExpenses(ctx.role)) {
      return { data: null, error: "You do not have access to expenses" };
    }

    const result = await fetchExpensesOverview(ctx.supabase, ctx.gymId, params);
    return { data: result, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load expenses",
    };
  }
}

export async function createExpense(
  raw: CreateExpenseInput,
): Promise<{ expenseId: string | null; error: string | null }> {
  const parsed = createExpenseSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      expenseId: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const ctx = await getActionContextWithStaff();
  if (!ctx) return { expenseId: null, error: "Not authenticated" };

  const data = parsed.data;
  if (data.category === "salary") {
    if (!canRecordSalary(ctx.role)) {
      return {
        expenseId: null,
        error: "Only the owner can record salary payments",
      };
    }
  } else if (!canRecordExpense(ctx.role)) {
    return { expenseId: null, error: "Not allowed to record expenses" };
  }

  const { supabase } = ctx;
  let description = data.description;
  let is_salary_full_month = data.is_salary_full_month ?? true;

  if (data.category === "salary" && data.staff_id) {
    const { data: staffRow } = await supabase
      .from("staff")
      .select("id, name, monthly_salary")
      .eq("gym_id", ctx.gymId)
      .eq("id", data.staff_id)
      .maybeSingle();

    if (!staffRow) {
      return { expenseId: null, error: "Staff member not found" };
    }

    if (data.salary_mode === "partial") {
      is_salary_full_month = false;
    } else if (data.salary_mode === "advance") {
      is_salary_full_month = false;
    } else {
      is_salary_full_month = true;
    }

    if (!description.trim() || description === "Salary") {
      const monthLabel = data.salary_month
        ? new Date(
            `${normalizeSalaryMonth(data.salary_month)}T12:00:00`,
          ).toLocaleDateString("en-GB", { month: "long" })
        : "salary";
      description = `${staffRow.name} — ${monthLabel} salary`;
    }
  }

  const recordedBy = data.recorded_by || ctx.staffId;
  const salaryMonth = data.salary_month
    ? normalizeSalaryMonth(data.salary_month)
    : null;

  const { data: inserted, error } = await supabase
    .from("expenses")
    .insert({
      gym_id: ctx.gymId,
      category: data.category,
      description,
      amount: data.amount,
      payment_method: data.payment_method,
      staff_id: data.category === "salary" ? data.staff_id : null,
      salary_month: data.category === "salary" ? salaryMonth : null,
      is_salary_full_month:
        data.category === "salary" ? is_salary_full_month : true,
      expense_date:
        data.expense_date || new Date().toISOString().slice(0, 10),
      status: data.status ?? "paid",
      notes: data.notes || null,
      receipt_url: data.receipt_url || null,
      recorded_by: recordedBy,
    })
    .select("id")
    .single();

  if (error) return { expenseId: null, error: error.message };

  await logAuditAction(supabase, {
    gymId: ctx.gymId,
    actorStaffId: ctx.staffId,
    action: "expense_added",
    entityType: "expense",
    entityId: inserted.id,
    details: {
      category: data.category,
      amount: data.amount,
      staff_id: data.staff_id,
    },
  });

  revalidateExpenses(data.staff_id);
  return { expenseId: inserted.id, error: null };
}

export async function updateExpense(
  raw: UpdateExpenseInput,
): Promise<{ error: string | null }> {
  const parsed = updateExpenseSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ctx = await getActionContextWithStaff();
  if (!ctx) return { error: "Not authenticated" };
  if (!canManageExpenses(ctx.role)) {
    return { error: "Not allowed" };
  }

  const { id, ...rest } = parsed.data;
  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) updates[key] = value;
  }
  if (updates.salary_month && typeof updates.salary_month === "string") {
    updates.salary_month = normalizeSalaryMonth(updates.salary_month);
  }

  const { supabase } = ctx;
  const { data: existing } = await supabase
    .from("expenses")
    .select("id, staff_id, category")
    .eq("gym_id", ctx.gymId)
    .eq("id", id)
    .maybeSingle();

  if (!existing) return { error: "Expense not found" };
  if (existing.category === "salary" && !canRecordSalary(ctx.role)) {
    return { error: "Only the owner can update salary expenses" };
  }

  const { error } = await supabase
    .from("expenses")
    .update(updates)
    .eq("gym_id", ctx.gymId)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateExpenses(existing.staff_id);
  return { error: null };
}

export async function deleteExpense(
  id: string,
): Promise<{ error: string | null }> {
  const ctx = await getActionContextWithStaff();
  if (!ctx) return { error: "Not authenticated" };
  if (!canManageExpenses(ctx.role)) {
    return { error: "Not allowed" };
  }

  const { supabase } = ctx;
  const { data: existing } = await supabase
    .from("expenses")
    .select("id, staff_id, category")
    .eq("gym_id", ctx.gymId)
    .eq("id", id)
    .maybeSingle();

  if (!existing) return { error: "Expense not found" };
  if (existing.category === "salary" && !canRecordSalary(ctx.role)) {
    return { error: "Only the owner can cancel salary expenses" };
  }

  const { error } = await supabase
    .from("expenses")
    .update({ status: "cancelled" })
    .eq("gym_id", ctx.gymId)
    .eq("id", id);

  if (error) return { error: error.message };

  await logAuditAction(supabase, {
    gymId: ctx.gymId,
    actorStaffId: ctx.staffId,
    action: "expense_cancelled",
    entityType: "expense",
    entityId: id,
  });

  revalidateExpenses(existing.staff_id);
  return { error: null };
}

export async function getReceiptSignedUrl(
  path: string,
): Promise<{ url: string | null; error: string | null }> {
  const ctx = await getActionContextWithStaff();
  if (!ctx) return { url: null, error: "Not authenticated" };
  if (!canManageExpenses(ctx.role)) {
    return { url: null, error: "Not allowed" };
  }

  // receipt_url may be a full signed URL or a storage path
  if (path.startsWith("http")) {
    return { url: path, error: null };
  }

  const { data, error } = await ctx.supabase.storage
    .from("receipts")
    .createSignedUrl(path, 60 * 60);

  if (error) return { url: null, error: error.message };
  return { url: data.signedUrl, error: null };
}
