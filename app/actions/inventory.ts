"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  canManageInventory,
  canRecordSale,
  canViewInventory,
} from "@/lib/auth/permissions";
import { logAuditAction } from "@/lib/audit/log-action";
import {
  fetchInventoryOverview,
  searchInventoryItems,
  searchMembersForSale,
  type InventoryListParams,
} from "@/lib/inventory/queries";
import {
  createItemSchema,
  createSaleSchema,
  updateItemSchema,
  type CreateItemInput,
  type CreateSaleInput,
  type UpdateItemInput,
} from "@/lib/validations/inventory";
import type {
  InventoryListResult,
  InventoryListRow,
  MemberSalePickerItem,
  StaffRole,
} from "@/lib/types";

type AuthContext = {
  gymId: string;
  userId: string;
  role: StaffRole;
  staffId: string;
};

async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const gymId = user.user_metadata?.gym_id as string | undefined;
  const role = user.user_metadata?.role as StaffRole | undefined;
  if (!gymId || !role) return null;

  const { data: staffRow } = await supabase
    .from("staff")
    .select("id")
    .eq("gym_id", gymId)
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!staffRow) return null;

  return {
    gymId,
    userId: user.id,
    role,
    staffId: staffRow.id,
  };
}

function revalidateInventory() {
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/fees");
}

export async function getInventoryItems(
  params: InventoryListParams = {},
): Promise<{ data: InventoryListResult | null; error: string | null }> {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return { data: null, error: "Not authenticated" };
    if (!canViewInventory(ctx.role)) {
      return { data: null, error: "You do not have access to inventory" };
    }

    const supabase = await createClient();
    const result = await fetchInventoryOverview(supabase, ctx.gymId, params);
    return { data: result, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load inventory",
    };
  }
}

export async function createItem(
  raw: CreateItemInput,
): Promise<{ itemId: string | null; error: string | null }> {
  const parsed = createItemSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      itemId: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const ctx = await getAuthContext();
  if (!ctx) return { itemId: null, error: "Not authenticated" };
  if (!canManageInventory(ctx.role)) {
    return { itemId: null, error: "Not allowed to manage inventory" };
  }

  const data = parsed.data;
  const supabase = await createClient();
  const { data: inserted, error } = await supabase
    .from("inventory_items")
    .insert({
      gym_id: ctx.gymId,
      name: data.name,
      category: data.category ?? "other",
      description: data.description || null,
      photo_url: data.photo_url || null,
      sku: data.sku || null,
      unit_cost: data.unit_cost ?? 0,
      selling_price: data.selling_price,
      stock_qty: data.stock_qty,
      low_stock_threshold: data.low_stock_threshold ?? 5,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) return { itemId: null, error: error.message };

  await logAuditAction(supabase, {
    gymId: ctx.gymId,
    actorStaffId: ctx.staffId,
    action: "inventory_item_created",
    entityType: "inventory_item",
    entityId: inserted.id,
    details: { name: data.name },
  });

  revalidateInventory();
  return { itemId: inserted.id, error: null };
}

export async function updateItem(
  raw: UpdateItemInput,
): Promise<{ error: string | null }> {
  const parsed = updateItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ctx = await getAuthContext();
  if (!ctx) return { error: "Not authenticated" };
  if (!canManageInventory(ctx.role)) {
    return { error: "Not allowed" };
  }

  const { id, ...rest } = parsed.data;
  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) updates[key] = value;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory_items")
    .update(updates)
    .eq("gym_id", ctx.gymId)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateInventory();
  return { error: null };
}

export async function searchSaleMembers(
  search: string,
): Promise<{ data: MemberSalePickerItem[]; error: string | null }> {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return { data: [], error: "Not authenticated" };
    if (!canRecordSale(ctx.role)) {
      return { data: [], error: "Not allowed" };
    }
    const supabase = await createClient();
    const data = await searchMembersForSale(supabase, ctx.gymId, search);
    return { data, error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Search failed",
    };
  }
}

export async function searchSaleItems(
  search: string,
): Promise<{ data: InventoryListRow[]; error: string | null }> {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return { data: [], error: "Not authenticated" };
    if (!canRecordSale(ctx.role)) {
      return { data: [], error: "Not allowed" };
    }
    const supabase = await createClient();
    const data = await searchInventoryItems(supabase, ctx.gymId, search);
    return { data, error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Search failed",
    };
  }
}

export async function createSale(
  raw: CreateSaleInput,
): Promise<{ saleId: string | null; error: string | null }> {
  const parsed = createSaleSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      saleId: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const ctx = await getAuthContext();
  if (!ctx) return { saleId: null, error: "Not authenticated" };
  if (!canRecordSale(ctx.role)) {
    return { saleId: null, error: "Not allowed to record sales" };
  }

  const data = parsed.data;
  const isWalkin = data.is_walkin || !data.member_id;
  const supabase = await createClient();

  const itemIds = data.items.map((i) => i.item_id);
  const { data: stockRows, error: stockError } = await supabase
    .from("inventory_items")
    .select("id, name, stock_qty, selling_price")
    .eq("gym_id", ctx.gymId)
    .in("id", itemIds);

  if (stockError) return { saleId: null, error: stockError.message };

  const stockMap = new Map((stockRows ?? []).map((r) => [r.id, r]));
  for (const line of data.items) {
    const item = stockMap.get(line.item_id);
    if (!item) {
      return { saleId: null, error: "One or more items were not found" };
    }
    if (Number(item.stock_qty) < line.quantity) {
      return {
        saleId: null,
        error: `Insufficient stock for ${item.name} (have ${item.stock_qty})`,
      };
    }
  }

  const subtotal = data.items.reduce(
    (sum, line) => sum + line.unit_price * line.quantity,
    0,
  );
  const discount = data.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const itemNames = data.items
    .map((line) => {
      const item = stockMap.get(line.item_id);
      return `${item?.name ?? "Item"} ×${line.quantity}`;
    })
    .join(", ");

  const { data: sale, error: saleError } = await supabase
    .from("inventory_sales")
    .insert({
      gym_id: ctx.gymId,
      member_id: isWalkin ? null : data.member_id,
      is_walkin: isWalkin,
      subtotal,
      discount,
      total,
      payment_method: data.payment_method,
      recorded_by: ctx.staffId,
      notes: data.notes || itemNames,
    })
    .select("id")
    .single();

  if (saleError || !sale) {
    return { saleId: null, error: saleError?.message ?? "Failed to create sale" };
  }

  const lineRows = data.items.map((line) => ({
    sale_id: sale.id,
    item_id: line.item_id,
    quantity: line.quantity,
    unit_price: line.unit_price,
    line_total: line.unit_price * line.quantity,
  }));

  const { error: linesError } = await supabase
    .from("inventory_sale_items")
    .insert(lineRows);

  if (linesError) {
    await supabase.from("inventory_sales").delete().eq("id", sale.id);
    return { saleId: null, error: linesError.message };
  }

  if (data.payment_method === "member_tab" && data.member_id) {
    const dueDate = new Date().toISOString().slice(0, 10);
    const { error: dueError } = await supabase.from("fee_dues").insert({
      gym_id: ctx.gymId,
      member_id: data.member_id,
      amount_due: total,
      amount_paid: 0,
      due_date: dueDate,
      status: "pending",
      generated_for_month: startOfMonthForDue(),
      notes: `Product sale: ${itemNames}`,
    });
    if (dueError) {
      console.error("Failed to create member tab fee due:", dueError.message);
    }
  } else if (data.member_id && data.payment_method !== "member_tab") {
    const method =
      data.payment_method === "card" || data.payment_method === "other"
        ? data.payment_method
        : data.payment_method;

    if (
      method === "cash" ||
      method === "easypaisa" ||
      method === "jazzcash" ||
      method === "bank_transfer" ||
      method === "card" ||
      method === "other"
    ) {
      const { error: payError } = await supabase.from("payments").insert({
        gym_id: ctx.gymId,
        member_id: data.member_id,
        amount: total,
        payment_type: "product",
        payment_method: method,
        is_partial: false,
        notes: `Product sale: ${itemNames}`,
        recorded_by: ctx.staffId,
      });
      if (payError) {
        console.error("Failed to create product payment:", payError.message);
      }
    }
  }

  await logAuditAction(supabase, {
    gymId: ctx.gymId,
    actorStaffId: ctx.staffId,
    action: "inventory_sale_recorded",
    entityType: "inventory_sale",
    entityId: sale.id,
    details: {
      total,
      payment_method: data.payment_method,
      member_id: data.member_id,
      item_count: data.items.length,
    },
  });

  revalidateInventory();
  return { saleId: sale.id, error: null };
}

function startOfMonthForDue(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export async function getInventoryPermissions(): Promise<{
  canManage: boolean;
  canSell: boolean;
  currentStaffId: string | null;
}> {
  const ctx = await getAuthContext();
  if (!ctx) {
    return { canManage: false, canSell: false, currentStaffId: null };
  }
  return {
    canManage: canManageInventory(ctx.role),
    canSell: canRecordSale(ctx.role),
    currentStaffId: ctx.staffId,
  };
}
