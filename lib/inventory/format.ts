import type { InventoryCategory } from "@/lib/types";
export {
  monthLabel,
  startOfMonthIso,
  previousMonthStart,
} from "@/lib/format/date";

export const INVENTORY_CATEGORY_LABELS: Record<InventoryCategory, string> = {
  supplements: "Supplements",
  drinks: "Drinks",
  snacks: "Snacks",
  accessories: "Accessories",
  apparel: "Apparel",
  other: "Other",
};

export const INVENTORY_CATEGORY_AVATAR: Record<
  InventoryCategory,
  { background: string; color: string }
> = {
  supplements: { background: "#E7F0EA", color: "#1B5E3C" },
  drinks: { background: "#E3EAEE", color: "#4E6C7C" },
  snacks: { background: "#F2E2D8", color: "#A05A34" },
  accessories: { background: "#EDEBE4", color: "#7A7A70" },
  apparel: { background: "#E8E4EE", color: "#6B5B7A" },
  other: { background: "#EDEBE4", color: "#7A7A70" },
};

export type StockStatus = "in_stock" | "low" | "out";

export function getStockStatus(
  qty: number,
  threshold: number,
): StockStatus {
  if (qty <= 0) return "out";
  if (qty <= threshold) return "low";
  return "in_stock";
}

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  in_stock: "In Stock",
  low: "Low Stock",
  out: "Out of Stock",
};

export const STOCK_STATUS_PILL: Record<
  StockStatus,
  { background: string; color: string }
> = {
  in_stock: { background: "#E4F1E9", color: "#2E7D4F" },
  low: { background: "#FBEFD6", color: "#B07A15" },
  out: { background: "#F3E4E1", color: "#B0574A" },
};

export function calcMarginPercent(
  unitCost: number,
  sellingPrice: number,
): number | null {
  if (unitCost <= 0) return null;
  return ((sellingPrice - unitCost) / unitCost) * 100;
}

export function itemInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
