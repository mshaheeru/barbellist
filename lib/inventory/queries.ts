import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  InventoryCategory,
  InventoryItem,
  InventoryListResult,
  InventoryListRow,
  InventorySummary,
  MemberSalePickerItem,
} from "@/lib/types";
import {
  calcMarginPercent,
  getStockStatus,
  monthLabel,
  previousMonthStart,
  startOfMonthIso,
} from "@/lib/inventory/format";
import type { StockStatusFilter } from "@/lib/validations/inventory";

export type InventoryListParams = {
  search?: string;
  category?: InventoryCategory | "all";
  stock?: StockStatusFilter;
};

export async function fetchInventoryOverview(
  supabase: SupabaseClient,
  gymId: string,
  params: InventoryListParams = {},
): Promise<InventoryListResult> {
  const now = new Date();
  const monthStart = startOfMonthIso(now);
  const prevStart = previousMonthStart(now);

  let query = supabase
    .from("inventory_items")
    .select("*")
    .eq("gym_id", gymId)
    .eq("is_active", true)
    .order("name");

  if (params.category && params.category !== "all") {
    query = query.eq("category", params.category);
  }
  if (params.search?.trim()) {
    query = query.ilike("name", `%${params.search.trim()}%`);
  }

  const [itemsRes, salesMonthRes, salesPrevRes] = await Promise.all([
    query,
    supabase
      .from("inventory_sales")
      .select("total")
      .eq("gym_id", gymId)
      .gte("sold_at", `${monthStart}T00:00:00`),
    supabase
      .from("inventory_sales")
      .select("total")
      .eq("gym_id", gymId)
      .gte("sold_at", `${prevStart}T00:00:00`)
      .lt("sold_at", `${monthStart}T00:00:00`),
  ]);

  if (itemsRes.error) throw new Error(itemsRes.error.message);

  const items = (itemsRes.data ?? []) as InventoryItem[];
  const allRows: InventoryListRow[] = items.map((item) => {
    const stock_qty = Number(item.stock_qty);
    const unit_cost = Number(item.unit_cost);
    const selling_price = Number(item.selling_price);
    const threshold = Number(item.low_stock_threshold ?? 5);
    return {
      ...item,
      stock_qty,
      unit_cost,
      selling_price,
      low_stock_threshold: threshold,
      margin_percent: calcMarginPercent(unit_cost, selling_price),
      stock_status: getStockStatus(stock_qty, threshold),
    };
  });

  let rows = allRows;
  if (params.stock && params.stock !== "all") {
    rows = allRows.filter((r) => r.stock_status === params.stock);
  }

  const salesThisMonth = (salesMonthRes.data ?? []).reduce(
    (sum, r) => sum + Number(r.total ?? 0),
    0,
  );
  const salesLastMonth = (salesPrevRes.data ?? []).reduce(
    (sum, r) => sum + Number(r.total ?? 0),
    0,
  );

  let salesTrendPercent: number | null = null;
  if (salesLastMonth > 0) {
    salesTrendPercent =
      ((salesThisMonth - salesLastMonth) / salesLastMonth) * 100;
  } else if (salesThisMonth > 0) {
    salesTrendPercent = 100;
  }

  const lowStockCount = allRows.filter((r) => r.stock_status === "low").length;
  const outOfStockCount = allRows.filter((r) => r.stock_status === "out").length;
  const stockValueAtCost = allRows.reduce(
    (sum, r) => sum + r.unit_cost * r.stock_qty,
    0,
  );

  const summary: InventorySummary = {
    itemsInStock: allRows.length,
    stockValueAtCost,
    lowStockCount,
    outOfStockCount,
    salesThisMonth,
    salesLastMonth,
    salesTrendPercent,
    monthLabel: monthLabel(now),
  };

  return {
    summary,
    data: rows,
    meta: { total: rows.length },
  };
}

export async function searchMembersForSale(
  supabase: SupabaseClient,
  gymId: string,
  search: string,
): Promise<MemberSalePickerItem[]> {
  let query = supabase
    .from("members")
    .select(
      `
      id, name, member_code, photo_url,
      packages(name)
    `,
    )
    .eq("gym_id", gymId)
    .neq("status", "cancelled")
    .order("name")
    .limit(12);

  if (search.trim()) {
    query = query.or(
      `name.ilike.%${search.trim()}%,member_code.ilike.%${search.trim()}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((m) => {
    const pkg = m.packages;
    const package_name = Array.isArray(pkg)
      ? (pkg[0]?.name ?? null)
      : ((pkg as { name: string } | null)?.name ?? null);
    return {
      id: m.id,
      name: m.name,
      member_code: m.member_code,
      photo_url: m.photo_url,
      package_name,
    };
  });
}

export async function searchInventoryItems(
  supabase: SupabaseClient,
  gymId: string,
  search: string,
): Promise<InventoryListRow[]> {
  let query = supabase
    .from("inventory_items")
    .select("*")
    .eq("gym_id", gymId)
    .eq("is_active", true)
    .gt("stock_qty", 0)
    .order("name")
    .limit(15);

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return ((data ?? []) as InventoryItem[]).map((item) => {
    const stock_qty = Number(item.stock_qty);
    const unit_cost = Number(item.unit_cost);
    const selling_price = Number(item.selling_price);
    const threshold = Number(item.low_stock_threshold ?? 5);
    return {
      ...item,
      stock_qty,
      unit_cost,
      selling_price,
      low_stock_threshold: threshold,
      margin_percent: calcMarginPercent(unit_cost, selling_price),
      stock_status: getStockStatus(stock_qty, threshold),
    };
  });
}
