"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { updateItem } from "@/app/actions/inventory";
import { useGym } from "@/components/gym-provider";
import {
  INVENTORY_CATEGORY_AVATAR,
  INVENTORY_CATEGORY_LABELS,
  STOCK_STATUS_LABELS,
  STOCK_STATUS_PILL,
  itemInitials,
} from "@/lib/inventory/format";
import { formatCurrency } from "@/lib/members/format";
import type { InventoryListRow } from "@/lib/types";
import styles from "./inventory.module.css";

type InventoryTableProps = {
  rows: InventoryListRow[];
  canManage: boolean;
};

export function InventoryTable({ rows, canManage }: InventoryTableProps) {
  const { currencySymbol } = useGym();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const deactivate = (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"?`)) return;
    startTransition(async () => {
      const { error } = await updateItem({ id, is_active: false });
      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }
      notifications.show({ color: "green", message: "Item deactivated." });
      router.refresh();
    });
  };

  if (rows.length === 0) {
    return (
      <div className={styles.tableWrap}>
        <div className={styles.emptyState}>
          No inventory items yet. Add your first SKU to start selling.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <div className={styles.tableHead}>
        <span>Item</span>
        <span>Category</span>
        <span>Stock</span>
        <span>Unit Cost</span>
        <span>Selling</span>
        <span>Margin</span>
        <span>Status</span>
        <span />
      </div>
      {rows.map((row) => {
        const avatar = INVENTORY_CATEGORY_AVATAR[row.category];
        const statusPill = STOCK_STATUS_PILL[row.stock_status];
        const stockClass =
          row.stock_status === "out"
            ? styles.stockOut
            : row.stock_status === "low"
              ? styles.stockLow
              : "";

        return (
          <div key={row.id} className={styles.tableRow}>
            <div className={styles.itemCell}>
              <div
                className={styles.itemAvatar}
                style={{
                  background: avatar.background,
                  color: avatar.color,
                }}
              >
                {row.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.photo_url} alt="" />
                ) : (
                  itemInitials(row.name)
                )}
              </div>
              <span className={styles.itemName}>{row.name}</span>
            </div>
            <span className={styles.mutedCell}>
              {INVENTORY_CATEGORY_LABELS[row.category]}
            </span>
            <span className={`${styles.num} ${styles.stockCell} ${stockClass}`}>
              {row.stock_qty}
            </span>
            <span className={`${styles.num} ${styles.mutedCell}`}>
              {formatCurrency(row.unit_cost, currencySymbol)}
            </span>
            <span className={`${styles.num} ${styles.stockCell}`}>
              {formatCurrency(row.selling_price, currencySymbol)}
            </span>
            <span className={`${styles.num} ${styles.marginCell}`}>
              {row.margin_percent == null
                ? "—"
                : `+${Math.round(row.margin_percent)}%`}
            </span>
            <span>
              <span
                className={styles.pill}
                style={{
                  background: statusPill.background,
                  color: statusPill.color,
                }}
              >
                {STOCK_STATUS_LABELS[row.stock_status]}
              </span>
            </span>
            <span style={{ textAlign: "center" }}>
              {canManage ? (
                <button
                  type="button"
                  className={styles.menuBtn}
                  onClick={() => deactivate(row.id, row.name)}
                  disabled={pending}
                  title="Deactivate item"
                  aria-label="Deactivate item"
                >
                  ⋯
                </button>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}
