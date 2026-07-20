"use client";

import { useState } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import { PageHeaderStart } from "@/components/dashboard/page-header-start";
import { AddItemModal } from "@/components/inventory/add-item-modal";
import { RecordSaleModal } from "@/components/modals/record-sale-modal";
import type { InventorySummary } from "@/lib/types";
import styles from "./inventory.module.css";

type InventoryPageHeaderProps = {
  summary: InventorySummary;
  canManage: boolean;
  canSell: boolean;
};

export function InventoryPageHeader({
  summary,
  canManage,
  canSell,
}: InventoryPageHeaderProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);

  return (
    <>
      <div className={styles.pageHeader}>
        <PageHeaderStart
          title="Inventory"
          titleClassName={styles.pageTitle}
          subtitleClassName={styles.pageSubtitle}
          subtitle={`${summary.itemsInStock} SKUs · supplements, drinks & accessories for retail`}
        />
        <div className={styles.headerActions}>
          {canManage ? (
            <button
              type="button"
              className={styles.outlineBtn}
              onClick={() => setAddOpen(true)}
            >
              <Plus size={16} strokeWidth={2.2} color="#1B5E3C" />
              Add Item
            </button>
          ) : null}
          {canSell ? (
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => setSaleOpen(true)}
            >
              <ShoppingCart size={16} strokeWidth={2} />
              Record Sale
            </button>
          ) : null}
        </div>
      </div>
      <AddItemModal opened={addOpen} onClose={() => setAddOpen(false)} />
      <RecordSaleModal opened={saleOpen} onClose={() => setSaleOpen(false)} />
    </>
  );
}
