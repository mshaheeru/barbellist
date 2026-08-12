"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  MessageCircle,
  Phone,
  Receipt,
  TrendingUp,
  TriangleAlert,
  Users,
  Activity,
} from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  prepareBulkReminderDeeplinks,
  prepareFeeReminderDeeplink,
} from "@/app/actions/whatsapp";
import { canRecordPayment } from "@/lib/auth/permissions";
import type { DashboardData } from "@/lib/dashboard/types";
import { formatCurrency } from "@/lib/members/format";
import { openWaMeUrl } from "@/lib/whatsapp/deeplink";
import { useGym } from "@/components/gym-provider";
import { DashboardTopBar } from "@/components/dashboard/top-bar";
import { RecordPaymentModal } from "@/components/modals/record-payment-modal";
import styles from "./dashboard.module.css";

type OwnerDashboardProps = {
  data: DashboardData;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTrend(
  percent: number | null,
  lastMonthLabel: string,
): { text: string; tone: "up" | "down" | "warn" } {
  if (percent == null) {
    return { text: `vs ${lastMonthLabel.split(" ")[0] ?? "last month"}`, tone: "down" };
  }
  const sign = percent > 0 ? "+" : "";
  const short = lastMonthLabel.split(" ")[0] ?? "last month";
  return {
    text: `${sign}${percent}% vs ${short}`,
    tone: percent >= 0 ? "up" : "down",
  };
}

function makeChartTooltip(showExpenses: boolean) {
  // Recharts tooltip content — keep props loose for version typing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function ChartTooltipInner({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
      <div className={styles.chartTooltip}>
        <div className={styles.chartTooltipLabel}>{label}</div>
        {payload.map(
          (entry: {
            dataKey?: string | number;
            value?: number;
            color?: string;
          }) => {
            const key = String(entry.dataKey ?? "");
            if (!showExpenses && (key === "expenses" || key === "profit")) {
              return null;
            }
            const name =
              key === "revenue"
                ? "Revenue"
                : key === "expenses"
                  ? "Expenses"
                  : "Profit";
            return (
              <div key={key} className={styles.chartTooltipRow}>
                <span style={{ color: entry.color }}>{name}</span>
                <span className={styles.num}>
                  {formatCurrency(Number(entry.value ?? 0))}
                </span>
              </div>
            );
          },
        )}
      </div>
    );
  };
}

function KpiCard({
  label,
  value,
  valueClass,
  valueSize = "lg",
  icon,
  iconTone,
  trend,
  trendTone,
}: {
  label: string;
  value: string;
  valueClass?: string;
  valueSize?: "lg" | "md";
  icon: ReactNode;
  iconTone: "green" | "grey" | "red";
  trend: string;
  trendTone: "up" | "down" | "warn";
}) {
  const iconClass =
    iconTone === "green"
      ? styles.iconBoxGreen
      : iconTone === "red"
        ? styles.iconBoxRed
        : styles.iconBoxGrey;

  const trendClass =
    trendTone === "up"
      ? styles.trendUp
      : trendTone === "warn"
        ? styles.trendWarn
        : styles.trendDown;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>{label}</span>
        <div className={`${styles.iconBox} ${iconClass}`}>{icon}</div>
      </div>
      <div
        className={`${styles.num} ${valueSize === "lg" ? styles.kpiValue : `${styles.kpiValue} ${styles.kpiValueMd}`} ${valueClass ?? ""}`}
      >
        {value}
      </div>
      <div className={`${styles.trend} ${trendClass}`}>
        {trendTone === "up" ? (
          <ArrowUpRight size={13} strokeWidth={2.4} />
        ) : trendTone === "down" ? (
          <ArrowDownRight size={13} strokeWidth={2.4} />
        ) : null}
        {trend}
      </div>
    </div>
  );
}

function Avatar({
  initials,
  tone,
  photoUrl,
  size = "md",
}: {
  initials: string;
  tone: "green" | "amber";
  photoUrl: string | null;
  size?: "md" | "sm";
}) {
  const cls =
    size === "sm"
      ? styles.expireAvatar
      : styles.avatar;
  const toneCls = tone === "green" ? styles.avatarGreen : styles.avatarAmber;

  if (photoUrl) {
    return (
      <img src={photoUrl} alt="" className={`${cls} ${styles.avatarImg}`} />
    );
  }

  return <div className={`${cls} ${toneCls}`}>{initials}</div>;
}

export function OwnerDashboard({
  data,
}: OwnerDashboardProps) {
  const router = useRouter();
  const { role } = useGym();
  const [pending, startTransition] = useTransition();
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);
  const [renewMemberId, setRenewMemberId] = useState<string | null>(null);
  const { visibility, kpis, chart, expenseBreakdown, feeAlerts, atRisk, expiring } =
    data;

  const canPay = canRecordPayment(role);
  const shortMonth = kpis.monthLabel.split(" ")[0] ?? kpis.monthLabel;
  const revenueTrend = formatTrend(
    kpis.revenueTrendPercent,
    kpis.lastMonthLabel,
  );
  const expensesTrend = formatTrend(
    kpis.expensesTrendPercent,
    kpis.lastMonthLabel,
  );
  const profitTrend = formatTrend(
    kpis.profitTrendPercent,
    kpis.lastMonthLabel,
  );

  const handleRemind = (feeDueId: string) => {
    startTransition(async () => {
      const { data: result, error } =
        await prepareFeeReminderDeeplink(feeDueId);
      if (error || !result) {
        notifications.show({
          color: "red",
          title: "Reminder failed",
          message: error ?? "Could not prepare reminder",
        });
        return;
      }
      openWaMeUrl(result.url);
      notifications.show({
        color: "green",
        message: `WhatsApp opened with reminder for ${result.memberName}`,
      });
      router.refresh();
    });
  };

  const handleSendAllOverdue = () => {
    startTransition(async () => {
      setBulkProgress("Preparing…");
      const result = await prepareBulkReminderDeeplinks("overdue");
      if (result.error) {
        setBulkProgress(null);
        notifications.show({
          color: "red",
          title: "Bulk send failed",
          message: result.error,
        });
        return;
      }

      const items = result.data;
      for (let i = 0; i < items.length; i++) {
        setBulkProgress(`Sending ${i + 1} of ${items.length}…`);
        openWaMeUrl(items[i]!.url);
        if (i < items.length - 1) await sleep(1000);
      }

      setBulkProgress(null);
      notifications.show({
        color: "green",
        title: "Reminders opened",
        message: `${items.length} WhatsApp chat(s) opened${
          result.skipped_no_whatsapp
            ? `, ${result.skipped_no_whatsapp} skipped`
            : ""
        }.`,
      });
      router.refresh();
    });
  };

  const remindBtn = (feeDueId: string, disabled: boolean) => (
    <button
      type="button"
      className={styles.btnRemind}
      disabled={disabled}
      onClick={() => handleRemind(feeDueId)}
    >
      <MessageCircle size={15} strokeWidth={2} />
      Remind
    </button>
  );

  const sendAllBtn = (
    <button
      type="button"
      className={styles.btnSendAll}
      disabled={pending || feeAlerts.length === 0}
      onClick={handleSendAllOverdue}
    >
      {bulkProgress ?? "Send All Overdue Reminders"}
    </button>
  );

  const kpiCount =
    Number(visibility.showMembers) +
    Number(visibility.showRevenue) +
    Number(visibility.showExpenses) +
    Number(visibility.showProfit) +
    Number(visibility.showOverdue) +
    Number(visibility.showAttendanceStats);

  return (
    <>
      <DashboardTopBar showAddMember />

      <div
        className={styles.kpiGrid}
        data-cols={kpiCount >= 5 ? "5" : String(Math.max(kpiCount, 1))}
      >
        {visibility.showMembers ? (
          <KpiCard
            label="Active Members"
            value={String(kpis.activeMembers)}
            icon={<Users size={16} strokeWidth={2} />}
            iconTone="green"
            trend={`+${kpis.newMembersThisMonth} this month`}
            trendTone={kpis.newMembersThisMonth > 0 ? "up" : "down"}
          />
        ) : null}

        {visibility.showAttendanceStats ? (
          <KpiCard
            label="Check-ins Today"
            value={String(kpis.checkInsToday ?? 0)}
            icon={<Activity size={16} strokeWidth={2} />}
            iconTone="green"
            trend="Live gym activity"
            trendTone="up"
          />
        ) : null}

        {visibility.showRevenue ? (
          <KpiCard
            label={`Revenue · ${shortMonth}`}
            value={formatCurrency(kpis.revenueThisMonth)}
            valueClass={styles.kpiValueGreen}
            valueSize="md"
            icon={<DollarSign size={16} strokeWidth={2} />}
            iconTone="green"
            trend={revenueTrend.text}
            trendTone={revenueTrend.tone}
          />
        ) : null}

        {visibility.showExpenses ? (
          <KpiCard
            label={`Expenses · ${shortMonth}`}
            value={formatCurrency(kpis.expensesThisMonth ?? 0)}
            valueClass={styles.kpiValueMuted}
            valueSize="md"
            icon={<Receipt size={16} strokeWidth={2} />}
            iconTone="grey"
            trend={expensesTrend.text}
            trendTone={
              (kpis.expensesTrendPercent ?? 0) > 0 ? "down" : expensesTrend.tone
            }
          />
        ) : null}

        {visibility.showProfit ? (
          <div className={`${styles.card} ${styles.profitCard}`}>
            <div className={styles.profitOrb} />
            <div className={styles.cardHeader}>
              <span
                className={styles.cardLabel}
                style={{ color: "rgba(255,255,255,0.72)" }}
              >
                Net Profit · {shortMonth}
              </span>
              <div
                className={styles.iconBox}
                style={{ background: "rgba(255,255,255,0.14)" }}
              >
                <TrendingUp size={16} stroke="#F1C271" strokeWidth={2} />
              </div>
            </div>
            <div className={`${styles.num} ${styles.profitValue}`}>
              {visibility.showProfitValue
                ? formatCurrency(kpis.profitThisMonth ?? 0)
                : "—"}
            </div>
            {visibility.showProfitValue ? (
              <span className={styles.profitBadge}>
                {(kpis.profitTrendPercent ?? 0) >= 0 ? (
                  <ArrowUpRight size={12} strokeWidth={2.6} />
                ) : (
                  <ArrowDownRight size={12} strokeWidth={2.6} />
                )}
                {profitTrend.text}
              </span>
            ) : null}
          </div>
        ) : null}

        {visibility.showOverdue ? (
          <div className={`${styles.card} ${styles.overdueCard}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>Overdue Fees</span>
              <div className={`${styles.iconBox} ${styles.iconBoxRed}`}>
                <TriangleAlert size={16} strokeWidth={2} />
              </div>
            </div>
            <div
              className={`${styles.num} ${styles.kpiValue} ${styles.kpiValueMd} ${styles.kpiValueRed}`}
            >
              {formatCurrency(kpis.overdueBalance)}
            </div>
            <div className={`${styles.trend} ${styles.trendWarn}`}>
              {kpis.overdueMemberCount} members outstanding
            </div>
          </div>
        ) : null}
      </div>

      {visibility.showChart ? (
        <div className={styles.panel}>
          <div className={styles.chartHeader}>
            <div>
              <div className={styles.panelTitle}>
                {visibility.showExpenses
                  ? "Revenue vs Expenses vs Profit — last 6 months"
                  : "Revenue — last 6 months"}
              </div>
              <div className={styles.panelSub}>
                {visibility.showExpenses
                  ? "Amber area shows monthly profit, in Rupees"
                  : "Monthly collected payments, in Rupees"}
              </div>
            </div>
            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={styles.legendLineGreen} />
                Revenue
              </span>
              {visibility.showExpenses ? (
                <>
                  <span className={styles.legendItem}>
                    <span className={styles.legendLineGrey} />
                    Expenses
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.legendBoxAmber} />
                    Profit
                  </span>
                </>
              ) : null}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart
              data={chart}
              margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            >
              <CartesianGrid stroke="#F0EBDF" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#9A9A90", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9A9A90", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={56}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                }
              />
              <RechartsTooltip
                content={makeChartTooltip(visibility.showExpenses)}
              />
              {visibility.showExpenses ? (
                <Area
                  type="monotone"
                  dataKey="profit"
                  fill="var(--color-accent)"
                  fillOpacity={0.2}
                  stroke="none"
                />
              ) : null}
              {visibility.showExpenses ? (
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#4A4A42"
                  strokeWidth={2.5}
                  dot={false}
                />
              ) : null}
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      {visibility.showExpenseBreakdown ? (
        <div className={styles.panel}>
          <div className={styles.panelTitle} style={{ marginBottom: 14 }}>
            Expense Breakdown · {shortMonth}
          </div>
          {expenseBreakdown.length === 0 ? (
            <p className={styles.emptyText}>No expenses recorded this month.</p>
          ) : (
            <Stack gap={15}>
              {expenseBreakdown.map((row) => (
                <div key={row.category} className={styles.expenseRow}>
                  <span className={styles.expenseName}>{row.label}</span>
                  <div className={styles.expenseBarTrack}>
                    <div
                      className={`${styles.expenseBarFill} ${row.tone === "amber" ? styles.expenseBarAmber : styles.expenseBarGreen}`}
                      style={{ width: `${row.widthPercent}%` }}
                    />
                  </div>
                  <span className={`${styles.num} ${styles.expenseAmount}`}>
                    {formatCurrency(row.amount)}
                  </span>
                </div>
              ))}
            </Stack>
          )}
        </div>
      ) : null}

      {visibility.showFeeAlerts || visibility.showAtRisk ? (
        <div className={styles.twoCol}>
          {visibility.showFeeAlerts ? (
            <div className={styles.panel} style={{ marginBottom: 0, padding: 20 }}>
              <div className={styles.sectionHead}>
                <div className={styles.sectionTitle}>
                  <span className={styles.dotRed} />
                  Fee Alerts
                </div>
                <div className={styles.feeAlertsActions}>
                  {sendAllBtn}
                  <Link
                    href="/dashboard/fees?status=overdue"
                    className={styles.linkGreen}
                  >
                    View all {kpis.overdueMemberCount}
                  </Link>
                </div>
              </div>
              {feeAlerts.length === 0 ? (
                <p className={styles.emptyText}>No overdue fees.</p>
              ) : (
                <Stack gap={12}>
                  {feeAlerts.map((item, i) => (
                    <div key={item.feeDueId}>
                      {i > 0 ? (
                        <div
                          className={styles.divider}
                          style={{ marginBottom: 12 }}
                        />
                      ) : null}
                      <div className={styles.listItem}>
                        <Avatar
                          initials={item.initials}
                          tone={item.tone}
                          photoUrl={item.photoUrl}
                        />
                        <div className={styles.itemBody}>
                          <div className={styles.itemName}>{item.name}</div>
                          <div className={styles.itemSub}>
                            {item.packageName ?? "Membership"} ·{" "}
                            {formatCurrency(item.balance)}
                          </div>
                        </div>
                        <span className={styles.pillRed}>
                          {item.daysOverdue}d overdue
                        </span>
                        {remindBtn(item.feeDueId, pending)}
                      </div>
                    </div>
                  ))}
                </Stack>
              )}
            </div>
          ) : null}

          {visibility.showAtRisk ? (
            <div className={styles.panel} style={{ marginBottom: 0, padding: 20 }}>
              <div className={styles.sectionHead}>
                <div className={styles.sectionTitle}>
                  <span className={styles.dotAmber} />
                  At-Risk Members
                </div>
                <Link href="/dashboard/members" className={styles.linkMuted}>
                  10+ days absent
                </Link>
              </div>
              {atRisk.length === 0 ? (
                <p className={styles.emptyText}>
                  No at-risk members right now.
                </p>
              ) : (
                <Stack gap={12}>
                  {atRisk.map((item, i) => (
                    <div key={item.memberId}>
                      {i > 0 ? (
                        <div
                          className={styles.divider}
                          style={{ marginBottom: 12 }}
                        />
                      ) : null}
                      <div className={styles.listItem}>
                        <Avatar
                          initials={item.initials}
                          tone={item.tone}
                          photoUrl={item.photoUrl}
                        />
                        <div className={styles.itemBody}>
                          <div className={styles.itemName}>{item.name}</div>
                          <div className={styles.itemSub}>
                            {item.daysAbsent >= 9999
                              ? "Never checked in"
                              : `Last visit ${item.daysAbsent} days ago`}
                          </div>
                        </div>
                        {item.phone ? (
                          <a
                            href={`tel:${item.phone.replace(/\s+/g, "")}`}
                            className={styles.btnCall}
                          >
                            <Phone size={15} stroke="var(--color-primary)" strokeWidth={2} />
                            Call
                          </a>
                        ) : (
                          <button
                            type="button"
                            className={styles.btnCall}
                            disabled
                          >
                            <Phone size={15} stroke="var(--color-primary)" strokeWidth={2} />
                            Call
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </Stack>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {visibility.showExpiring ? (
        <div>
          <div className={styles.expiringTitle}>
            Expiring This Week · Renewal Opportunities
          </div>
          {expiring.length === 0 ? (
            <p className={styles.emptyText}>
              No memberships expiring in the next 7 days.
            </p>
          ) : (
            <div className={styles.expiringGrid}>
              {expiring.map((m) => (
                <div key={m.memberId} className={styles.expireCard}>
                  <div className={styles.expireRow}>
                    <Avatar
                      initials={m.initials}
                      tone={m.tone}
                      photoUrl={m.photoUrl}
                      size="sm"
                    />
                    <div>
                      <div className={styles.expireName}>{m.name}</div>
                      <div className={styles.expirePlan}>
                        {m.packageName ?? "Membership"}
                      </div>
                    </div>
                  </div>
                  <div className={styles.expireBadge}>
                    Expires in {m.daysLeft}{" "}
                    {m.daysLeft === 1 ? "day" : "days"}
                  </div>
                  {canPay ? (
                    <button
                      type="button"
                      className={styles.btnRenew}
                      onClick={() => setRenewMemberId(m.memberId)}
                    >
                      Renew
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {renewMemberId ? (
        <RecordPaymentModal
          opened={Boolean(renewMemberId)}
          onClose={() => setRenewMemberId(null)}
          memberId={renewMemberId}
        />
      ) : null}
    </>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <div className={styles.skelTopBar}>
        <div className={styles.skelLine} style={{ width: 280, height: 28 }} />
        <div className={styles.skelLine} style={{ width: 360, height: 16 }} />
      </div>
      <div className={styles.kpiGrid}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`${styles.card} ${styles.skelCard}`}>
            <div className={styles.skelLine} style={{ width: "40%" }} />
            <div
              className={styles.skelLine}
              style={{ width: "60%", height: 28, marginTop: 16 }}
            />
            <div
              className={styles.skelLine}
              style={{ width: "50%", height: 12, marginTop: 12 }}
            />
          </div>
        ))}
      </div>
      <div className={`${styles.panel} ${styles.skelPanel}`}>
        <div className={styles.skelLine} style={{ width: 280, height: 18 }} />
        <div
          className={styles.skelBlock}
          style={{ height: 180, marginTop: 16 }}
        />
      </div>
      <div className={styles.twoCol}>
        <div className={`${styles.panel} ${styles.skelPanel}`}>
          <div className={styles.skelLine} style={{ width: 120 }} />
          <div className={styles.skelBlock} style={{ height: 140, marginTop: 16 }} />
        </div>
        <div className={`${styles.panel} ${styles.skelPanel}`}>
          <div className={styles.skelLine} style={{ width: 140 }} />
          <div className={styles.skelBlock} style={{ height: 140, marginTop: 16 }} />
        </div>
      </div>
    </>
  );
}
