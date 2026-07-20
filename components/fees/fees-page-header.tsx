"use client";

import { useGym } from "@/components/gym-provider";
import { PageHeaderStart } from "@/components/dashboard/page-header-start";
import { formatCurrency } from "@/lib/members/format";
import styles from "./fees.module.css";

type FeesPageHeaderClientProps = {
  overdueMemberCount: number;
  outstanding: number;
};

export function FeesPageHeaderClient({
  overdueMemberCount,
  outstanding,
}: FeesPageHeaderClientProps) {
  const { currencySymbol } = useGym();

  return (
    <header className={styles.pageHeader}>
      <PageHeaderStart
        title="Fees & Payments"
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSubtitle}
        subtitle={`${overdueMemberCount} members overdue · ${formatCurrency(outstanding, currencySymbol)} outstanding`}
      />
    </header>
  );
}
