import { Suspense } from "react";
import { getInventoryItems } from "@/app/actions/inventory";
import {
  canManageInventory,
  canRecordSale,
} from "@/lib/auth/permissions";
import { getUserRole } from "@/lib/auth/claims";
import { createClient } from "@/lib/supabase/server";
import type { InventoryCategory } from "@/lib/types";
import type { StockStatusFilter } from "@/lib/validations/inventory";
import { InventoryPageHeader } from "./inventory-page-header";
import { InventorySummaryCards } from "./inventory-summary-cards";
import { InventoryTable } from "./inventory-table";
import { InventoryToolbar } from "./inventory-toolbar";
import styles from "./inventory.module.css";

type InventoryListProps = {
  search?: string;
  category?: string;
  stock?: string;
};

export async function InventoryList(props: InventoryListProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = getUserRole(user);

  const { data, error } = await getInventoryItems({
    search: props.search,
    category: (props.category as InventoryCategory | "all") || "all",
    stock: (props.stock as StockStatusFilter) || "all",
  });

  if (error || !data) {
    return (
      <div className={styles.errorBox}>
        {error ?? "Failed to load inventory."}
      </div>
    );
  }

  const canManage = canManageInventory(role);
  const canSell = canRecordSale(role);

  return (
    <>
      <InventoryPageHeader
        summary={data.summary}
        canManage={canManage}
        canSell={canSell}
      />
      <InventorySummaryCards summary={data.summary} />
      <Suspense fallback={null}>
        <InventoryToolbar
          search={props.search}
          category={props.category}
          stock={props.stock}
        />
      </Suspense>
      <InventoryTable rows={data.data} canManage={canManage} />
    </>
  );
}

export function InventoryTableSkeleton() {
  return (
    <div>
      <div className={styles.skeleton} style={{ height: 64 }} />
      <div className={styles.kpiGrid}>
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
      </div>
      <div className={styles.skeleton} style={{ height: 320 }} />
    </div>
  );
}
