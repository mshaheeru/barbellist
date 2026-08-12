"use server";

import { revalidatePath } from "next/cache";
import { getActionContext } from "@/lib/auth/get-action-context";
import {
  clearDemoDataForGym,
  seedDemoDataForGym,
} from "@/lib/seed/demo-data";

function revalidateDemoPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/members");
  revalidatePath("/dashboard/fees");
  revalidatePath("/dashboard/staff");
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/settings");
}

export async function loadDemoData(): Promise<{ error: string | null }> {
  const ctx = await getActionContext({ requireOwner: true });
  if (!ctx) {
    return { error: "Only the gym owner can load demo data" };
  }

  const result = await seedDemoDataForGym(
    ctx.supabase,
    ctx.gymId,
    ctx.staffId,
  );
  if (!result.error) revalidateDemoPaths();
  return result;
}

export async function clearDemoData(): Promise<{ error: string | null }> {
  const ctx = await getActionContext({ requireOwner: true });
  if (!ctx) {
    return { error: "Only the gym owner can clear demo data" };
  }

  const result = await clearDemoDataForGym(ctx.supabase, ctx.gymId);
  if (!result.error) revalidateDemoPaths();
  return result;
}
