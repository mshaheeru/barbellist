"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getActionContextWithStaff } from "@/lib/auth/get-action-context";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  canManageStaff,
  canViewSalary,
  canViewStaffDirectory,
} from "@/lib/auth/permissions";
import {
  fetchStaffById,
  fetchStaffList,
  type StaffListParams,
} from "@/lib/staff/queries";
import {
  addNote,
  deleteNote,
  parseMemberNotes,
  serializeMemberNotes,
  updateNote,
  type MemberNote,
} from "@/lib/members/notes";
import {
  createStaffSchema,
  recordSalarySchema,
  staffNoteSchema,
  updateStaffSchema,
  type CreateStaffInput,
  type RecordSalaryInput,
  type UpdateStaffInput,
} from "@/lib/validations/staff";
import type { StaffListResult, StaffProfile } from "@/lib/types";

function revalidateStaff(id?: string) {
  revalidatePath("/dashboard/staff");
  if (id) revalidatePath(`/dashboard/staff/${id}`);
}

export async function getStaffList(
  params: StaffListParams = {},
): Promise<{ data: StaffListResult | null; error: string | null }> {
  try {
    const ctx = await getActionContextWithStaff();
    if (!ctx) return { data: null, error: "Not authenticated" };

    if (!canViewStaffDirectory(ctx.role)) {
      return { data: null, error: "You do not have access to the staff directory" };
    }

    const result = await fetchStaffList(ctx.supabase, ctx.gymId, params, {
      canViewSalary: canViewSalary(ctx.role),
    });
    return { data: result, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load staff",
    };
  }
}

export async function getStaffById(
  id: string,
): Promise<{ data: StaffProfile | null; error: string | null }> {
  try {
    const ctx = await getActionContextWithStaff();
    if (!ctx) return { data: null, error: "Not authenticated" };

    const canDirectory = canViewStaffDirectory(ctx.role);
    if (!canDirectory && ctx.staffId !== id) {
      return { data: null, error: "You can only view your own profile" };
    }

    const profile = await fetchStaffById(ctx.supabase, ctx.gymId, id, {
      canViewSalary: canViewSalary(ctx.role),
    });
    if (!profile) return { data: null, error: "Staff member not found" };
    return { data: profile, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load staff member",
    };
  }
}

export async function createStaff(
  raw: CreateStaffInput,
): Promise<{ data: { id: string } | null; error: string | null }> {
  const parsed = createStaffSchema.safeParse(raw);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ctx = await getActionContextWithStaff();
  if (!ctx) return { data: null, error: "Not authenticated" };
  if (!canManageStaff(ctx.role)) {
    return { data: null, error: "Only owners and managers can add staff" };
  }

  const data = parsed.data;
  if (data.role === "owner" && ctx.role !== "owner") {
    return { data: null, error: "Only the owner can create another owner" };
  }

  let authUserId: string | null = null;

  try {
    if (data.give_app_access && data.email && data.password) {
      const admin = createAdminClient();
      const { data: authData, error: authError } =
        await admin.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: true,
          app_metadata: {
            gym_id: ctx.gymId,
            organization_id: ctx.organizationId,
            role: data.role,
          },
          user_metadata: {
            name: data.name,
          },
        });

      if (authError || !authData.user) {
        return {
          data: null,
          error: authError?.message ?? "Failed to create login account",
        };
      }
      authUserId = authData.user.id;
    }

    const { supabase } = ctx;
    const joiningDate =
      data.joining_date?.trim() || new Date().toISOString().slice(0, 10);

    const { data: row, error } = await supabase
      .from("staff")
      .insert({
        gym_id: ctx.gymId,
        auth_user_id: authUserId,
        name: data.name,
        role: data.role,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        monthly_salary: data.monthly_salary ?? 0,
        commission_rate: data.commission_rate ?? 0,
        joining_date: joiningDate,
        photo_url: data.photo_url || null,
        status: "active",
      })
      .select("id")
      .single();

    if (error || !row) {
      if (authUserId) {
        try {
          const admin = createAdminClient();
          await admin.auth.admin.deleteUser(authUserId);
        } catch {
          // best-effort cleanup
        }
      }
      return { data: null, error: error?.message ?? "Failed to create staff" };
    }

    revalidateStaff(row.id);
    return { data: { id: row.id }, error: null };
  } catch (e) {
    if (authUserId) {
      try {
        const admin = createAdminClient();
        await admin.auth.admin.deleteUser(authUserId);
      } catch {
        // best-effort cleanup
      }
    }
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to create staff",
    };
  }
}

export async function updateStaff(
  id: string,
  raw: UpdateStaffInput,
): Promise<{ error: string | null }> {
  const parsed = updateStaffSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ctx = await getActionContextWithStaff();
  if (!ctx) return { error: "Not authenticated" };
  if (!canManageStaff(ctx.role)) {
    return { error: "Only owners and managers can edit staff" };
  }

  const payload = { ...parsed.data };
  if (payload.email === "") payload.email = null;

  if (payload.role === "owner" && ctx.role !== "owner") {
    return { error: "Only the owner can assign the owner role" };
  }

  if (payload.monthly_salary !== undefined && !canViewSalary(ctx.role)) {
    delete payload.monthly_salary;
  }
  if (payload.commission_rate !== undefined && !canViewSalary(ctx.role)) {
    delete payload.commission_rate;
  }

  const { error } = await ctx.supabase
    .from("staff")
    .update(payload)
    .eq("gym_id", ctx.gymId)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateStaff(id);
  return { error: null };
}

export async function deactivateStaff(
  id: string,
): Promise<{ error: string | null }> {
  const ctx = await getActionContextWithStaff();
  if (!ctx) return { error: "Not authenticated" };
  if (!canManageStaff(ctx.role)) {
    return { error: "Only owners and managers can deactivate staff" };
  }

  if (id === ctx.staffId) {
    return { error: "You cannot deactivate your own account" };
  }

  const { supabase } = ctx;
  const { data: target } = await supabase
    .from("staff")
    .select("role")
    .eq("gym_id", ctx.gymId)
    .eq("id", id)
    .maybeSingle();

  if (!target) return { error: "Staff member not found" };

  if (target.role === "owner") {
    const { count } = await supabase
      .from("staff")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", ctx.gymId)
      .eq("role", "owner")
      .eq("status", "active");

    if ((count ?? 0) <= 1) {
      return { error: "Cannot deactivate the only active owner" };
    }
  }

  const { error } = await supabase
    .from("staff")
    .update({ status: "inactive" })
    .eq("gym_id", ctx.gymId)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateStaff(id);
  return { error: null };
}

export async function recordSalaryPayment(
  raw: RecordSalaryInput,
): Promise<{ error: string | null }> {
  const parsed = recordSalarySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { createExpense } = await import("@/app/actions/expenses");
  const data = parsed.data;
  const { error } = await createExpense({
    category: "salary",
    description: "Salary",
    amount: data.amount,
    payment_method: data.payment_method,
    staff_id: data.staff_id,
    salary_month: data.salary_month,
    is_salary_full_month: data.is_salary_full_month ?? true,
    expense_date: data.expense_date,
    notes: data.notes,
    status: "paid",
  });

  return { error };
}

async function loadNotes(
  supabase: SupabaseClient,
  gymId: string,
  staffId: string,
): Promise<MemberNote[]> {
  const { data } = await supabase
    .from("staff")
    .select("notes")
    .eq("gym_id", gymId)
    .eq("id", staffId)
    .maybeSingle();
  return parseMemberNotes(data?.notes ?? null);
}

export async function addStaffNote(
  staffId: string,
  text: string,
): Promise<{ error: string | null }> {
  const parsed = staffNoteSchema.safeParse({ text });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid note" };
  }

  const ctx = await getActionContextWithStaff();
  if (!ctx) return { error: "Not authenticated" };
  if (!canManageStaff(ctx.role) && ctx.staffId !== staffId) {
    return { error: "Not allowed" };
  }

  const { supabase } = ctx;
  const notes = addNote(
    await loadNotes(supabase, ctx.gymId, staffId),
    parsed.data.text,
  );
  const { error } = await supabase
    .from("staff")
    .update({ notes: serializeMemberNotes(notes) })
    .eq("gym_id", ctx.gymId)
    .eq("id", staffId);

  if (error) return { error: error.message };
  revalidateStaff(staffId);
  return { error: null };
}

export async function editStaffNote(
  staffId: string,
  noteId: string,
  text: string,
): Promise<{ error: string | null }> {
  const parsed = staffNoteSchema.safeParse({ text });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid note" };
  }

  const ctx = await getActionContextWithStaff();
  if (!ctx) return { error: "Not authenticated" };
  if (!canManageStaff(ctx.role) && ctx.staffId !== staffId) {
    return { error: "Not allowed" };
  }

  const { supabase } = ctx;
  const notes = updateNote(
    await loadNotes(supabase, ctx.gymId, staffId),
    noteId,
    parsed.data.text,
  );
  const { error } = await supabase
    .from("staff")
    .update({ notes: serializeMemberNotes(notes) })
    .eq("gym_id", ctx.gymId)
    .eq("id", staffId);

  if (error) return { error: error.message };
  revalidateStaff(staffId);
  return { error: null };
}

export async function removeStaffNote(
  staffId: string,
  noteId: string,
): Promise<{ error: string | null }> {
  const ctx = await getActionContextWithStaff();
  if (!ctx) return { error: "Not authenticated" };
  if (!canManageStaff(ctx.role) && ctx.staffId !== staffId) {
    return { error: "Not allowed" };
  }

  const { supabase } = ctx;
  const notes = deleteNote(await loadNotes(supabase, ctx.gymId, staffId), noteId);
  const { error } = await supabase
    .from("staff")
    .update({ notes: serializeMemberNotes(notes) })
    .eq("gym_id", ctx.gymId)
    .eq("id", staffId);

  if (error) return { error: error.message };
  revalidateStaff(staffId);
  return { error: null };
}
