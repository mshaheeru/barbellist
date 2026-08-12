"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Popover } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Calendar, Download } from "lucide-react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  exportReportsCsv,
  getReportsData,
} from "@/app/actions/reports";
import {
  HEATMAP_BUCKET_LABELS,
  HEATMAP_DAY_LABELS,
  type ReportsData,
  type ReportsDonutSlice,
} from "@/lib/reports/types";
import { formatCurrency } from "@/lib/members/format";
import { PageHeaderStart } from "@/components/dashboard/page-header-start";
import styles from "./reports.module.css";

function formatCompactRs(amount: number): string {
  if (Math.abs(amount) >= 100_000) {
    const lakhs = amount / 100_000;
    const rounded =
      lakhs >= 10
        ? Math.round(lakhs * 10) / 10
        : Math.round(lakhs * 100) / 100;
    return `Rs. ${rounded}L`;
  }
  if (Math.abs(amount) >= 1000) {
    return `Rs. ${Math.round(amount / 1000)}k`;
  }
  return formatCurrency(amount);
}

function heatClass(intensity: number): string {
  switch (intensity) {
    case 1:
      return styles.heat1!;
    case 2:
      return styles.heat2!;
    case 3:
      return styles.heat3!;
    case 4:
      return styles.heat4!;
    case 5:
      return styles.heat5!;
    default:
      return styles.heat0!;
  }
}

function ProfitTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.chartTooltip}>
      <div className={styles.chartTooltipLabel}>{label}</div>
      <div className={`${styles.num} ${styles.chartTooltipValue}`}>
        {formatCurrency(payload[0]!.value)}
      </div>
    </div>
  );
}

function DonutCard({
  title,
  slices,
  centerValue,
  centerLabel,
}: {
  title: string;
  slices: ReportsDonutSlice[];
  centerValue?: string | number;
  centerLabel?: string;
}) {
  const data = slices.length
    ? slices
    : [{ key: "empty", label: "No data", value: 1, percent: 0, color: "#EAF3EE" }];

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>{title}</div>
      <div className={styles.donutBody}>
        <div className={styles.donutChartWrap}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={58}
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((s) => (
                  <Cell key={s.key} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {centerValue != null ? (
            <div className={styles.donutCenter}>
              <div className={`${styles.num} ${styles.donutCenterValue}`}>
                {centerValue}
              </div>
              {centerLabel ? (
                <div className={styles.donutCenterLabel}>{centerLabel}</div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className={styles.legend}>
          {slices.length === 0 ? (
            <p className={styles.emptyText}>No data for this period.</p>
          ) : (
            slices.map((s) => (
              <div key={s.key} className={styles.legendRow}>
                <span className={styles.legendLeft}>
                  <span
                    className={styles.legendSwatch}
                    style={{ background: s.color }}
                  />
                  {s.label}
                </span>
                <span className={`${styles.num} ${styles.legendPct}`}>
                  {s.percent}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

type Props = {
  initialData: ReportsData;
};

export function ReportsPage({ initialData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [fromDraft, setFromDraft] = useState(initialData.range.from);
  const [toDraft, setToDraft] = useState(initialData.range.to);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setData(initialData);
    setFromDraft(initialData.range.from);
    setToDraft(initialData.range.to);
  }, [initialData]);

  const { visibility, kpis } = data;

  function applyRange() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", fromDraft);
    params.set("to", toDraft);
    setRangeOpen(false);
    startTransition(async () => {
      const result = await getReportsData(fromDraft, toDraft);
      if (result.error || !result.data) {
        notifications.show({
          color: "red",
          message: result.error ?? "Failed to load reports",
        });
        return;
      }
      setData(result.data);
      router.replace(`/dashboard/reports?${params.toString()}`, {
        scroll: false,
      });
    });
  }

  async function handleExport() {
    setExporting(true);
    try {
      const result = await exportReportsCsv(data.range.from, data.range.to);
      if (result.error || !result.csv) {
        notifications.show({
          color: "red",
          message: result.error ?? "Export failed",
        });
        return;
      }
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `barbellist-reports-${data.range.from}_${data.range.to}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      notifications.show({
        color: "green",
        message: "Report exported",
      });
    } finally {
      setExporting(false);
    }
  }

  const sparkData = kpis.sparkline.map((v, i) => ({ i, v }));
  const trendPct = kpis.revenueTrendPercent;
  const trendPositive = trendPct != null && trendPct >= 0;

  return (
    <div className={styles.page} style={{ opacity: pending ? 0.7 : 1 }}>
      <div className={styles.header}>
        <PageHeaderStart
          title="Reports & Analytics"
          titleClassName={styles.title}
          subtitleClassName={styles.subtitle}
          subtitle="Performance overview for the selected period"
        />
        <div className={styles.headerActions}>
          <Popover
            opened={rangeOpen}
            onChange={setRangeOpen}
            position="bottom-end"
            shadow="md"
            radius="md"
          >
            <Popover.Target>
              <button
                type="button"
                className={styles.rangeBtn}
                onClick={() => setRangeOpen((o) => !o)}
              >
                <Calendar size={16} strokeWidth={2} color="#6B6B62" />
                {data.rangeLabel}
              </button>
            </Popover.Target>
            <Popover.Dropdown>
              <div className={styles.rangePopover}>
                <div className={styles.rangeField}>
                  <label className={styles.rangeLabel} htmlFor="reports-from">
                    From
                  </label>
                  <input
                    id="reports-from"
                    type="date"
                    className={styles.rangeInput}
                    value={fromDraft}
                    onChange={(e) => setFromDraft(e.target.value)}
                  />
                </div>
                <div className={styles.rangeField}>
                  <label className={styles.rangeLabel} htmlFor="reports-to">
                    To
                  </label>
                  <input
                    id="reports-to"
                    type="date"
                    className={styles.rangeInput}
                    value={toDraft}
                    onChange={(e) => setToDraft(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className={styles.rangeApply}
                  onClick={applyRange}
                >
                  Apply
                </button>
              </div>
            </Popover.Dropdown>
          </Popover>

          {visibility.canExport ? (
            <button
              type="button"
              className={styles.exportBtn}
              onClick={handleExport}
              disabled={exporting}
            >
              <Download size={16} strokeWidth={2} />
              {exporting ? "Exporting…" : "Export"}
            </button>
          ) : null}
        </div>
      </div>

      <div className={styles.kpiGrid}>
        {visibility.showRevenue ? (
          <div className={styles.card}>
            <div className={styles.cardLabel}>Revenue Trend</div>
            <div className={styles.kpiValueRow}>
              <div>
                <div className={`${styles.num} ${styles.kpiValue}`}>
                  {formatCompactRs(kpis.revenueTotal)}
                </div>
                {trendPct != null ? (
                  <div
                    className={
                      trendPositive ? styles.trendUp : styles.trendDown
                    }
                  >
                    {trendPositive ? "▲" : "▼"} {Math.abs(trendPct)}% vs prior
                    period
                  </div>
                ) : (
                  <div className={styles.trendMuted}>No prior period data</div>
                )}
              </div>
              {sparkData.length > 1 ? (
                <div style={{ width: 90, height: 44 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkData}>
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke="var(--color-primary)"
                        strokeWidth={2.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {visibility.showNewVsChurned ? (
          <div className={styles.card}>
            <div className={styles.cardLabel}>New vs Churned</div>
            <div className={styles.churnRow}>
              <span className={`${styles.num} ${styles.churnNew}`}>
                +{kpis.newMembers}
              </span>
              <span className={`${styles.num} ${styles.churnLost}`}>
                −{kpis.churnedMembers}
              </span>
            </div>
            <div
              className={
                kpis.netMembers >= 0 ? styles.trendUp : styles.trendDown
              }
            >
              Net {kpis.netMembers >= 0 ? "+" : ""}
              {kpis.netMembers} members this period
            </div>
          </div>
        ) : null}

        {visibility.showRetention ? (
          <div className={styles.card}>
            <div className={styles.cardLabel}>Avg. Retention</div>
            <div className={`${styles.num} ${styles.kpiValue}`}>
              {kpis.avgRetentionMonths != null
                ? kpis.avgRetentionMonths
                : "—"}{" "}
              {kpis.avgRetentionMonths != null ? (
                <span className={styles.kpiUnit}>months</span>
              ) : null}
            </div>
            {kpis.retentionYoYDelta != null ? (
              <div
                className={
                  kpis.retentionYoYDelta >= 0
                    ? styles.trendUp
                    : styles.trendDown
                }
              >
                {kpis.retentionYoYDelta >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(kpis.retentionYoYDelta)} months YoY
              </div>
            ) : (
              <div className={styles.trendMuted}>Insufficient YoY history</div>
            )}
          </div>
        ) : null}
      </div>

      {(visibility.showPackages || visibility.showPaymentMethods) && (
        <div className={styles.donutGrid}>
          {visibility.showPackages ? (
            <DonutCard
              title="Package Distribution"
              slices={data.packageDistribution}
              centerValue={data.packageMemberTotal}
              centerLabel="members"
            />
          ) : null}
          {visibility.showPaymentMethods ? (
            <DonutCard
              title="Payment Method Breakdown"
              slices={data.paymentMethods}
            />
          ) : null}
        </div>
      )}

      {(visibility.showProfit || visibility.showExpenses) && (
        <div className={styles.midGrid}>
          {visibility.showProfit ? (
            <div className={styles.card}>
              <div className={styles.panelHeader}>
                <div className={styles.cardTitle}>Profit Trend</div>
                {visibility.showProfitValue &&
                data.profitAvgPerMonth != null ? (
                  <span className={styles.panelMeta}>
                    Avg {formatCompactRs(data.profitAvgPerMonth)} / mo
                  </span>
                ) : (
                  <span className={styles.panelMetaMuted}>—</span>
                )}
              </div>
              <div className={styles.profitPanel}>
                {data.profitTrend.length === 0 ? (
                  <p className={styles.emptyText}>No profit data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart
                      data={data.profitTrend}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#7A9A88", fontSize: 11.5 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <RechartsTooltip content={<ProfitTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="var(--color-accent)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "var(--color-accent)", strokeWidth: 0 }}
                        activeDot={{
                          r: 4.5,
                          fill: "var(--color-accent)",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              {visibility.showProfitValue &&
              data.profitDeltaFromStart != null ? (
                <div className={styles.profitFootnote}>
                  Profit{" "}
                  {data.profitDeltaFromStart >= 0 ? "up" : "down"}{" "}
                  <span className={styles.profitFootnoteStrong}>
                    {formatCompactRs(Math.abs(data.profitDeltaFromStart))}
                  </span>{" "}
                  since {data.profitTrend[0]?.month ?? "start"}
                  {data.profitDeltaFromStart >= 0
                    ? " · steady climb"
                    : ""}
                </div>
              ) : visibility.showProfit && !visibility.showProfitValue ? (
                <div className={styles.profitFootnote}>
                  Profit details visible to owners only
                </div>
              ) : null}
            </div>
          ) : null}

          {visibility.showExpenses ? (
            <div className={styles.card}>
              <div className={styles.panelHeader}>
                <div className={styles.cardTitle}>Top Expense Categories</div>
                <span className={styles.panelMetaMuted}>
                  Full period · {formatCompactRs(data.expenseTotal)}
                </span>
              </div>
              {data.expenseBreakdown.length === 0 ? (
                <p className={styles.emptyText}>
                  No expenses in this period.
                </p>
              ) : (
                <div className={styles.expenseRows}>
                  {data.expenseBreakdown.map((row) => (
                    <div key={row.category} className={styles.expenseRow}>
                      <span className={styles.expenseName}>{row.label}</span>
                      <div className={styles.expenseBarTrack}>
                        <div
                          className={`${styles.expenseBarFill} ${
                            row.tone === "amber"
                              ? styles.expenseBarAmber
                              : styles.expenseBarGreen
                          }`}
                          style={{ width: `${row.widthPercent}%` }}
                        />
                      </div>
                      <span
                        className={`${styles.num} ${styles.expenseAmount}`}
                      >
                        {formatCompactRs(row.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {visibility.showHeatmap ? (
        <div className={styles.heatmapCard}>
          <div className={styles.panelHeader}>
            <div className={styles.cardTitle}>Attendance Heatmap</div>
            <div className={styles.heatmapLegend}>
              Less
              <span
                className={styles.heatSwatch}
                style={{ background: "#EAF3EE" }}
              />
              <span
                className={styles.heatSwatch}
                style={{ background: "#9FC3AE" }}
              />
              <span
                className={styles.heatSwatch}
                style={{ background: "#4E9A6E" }}
              />
              <span
                className={styles.heatSwatch}
                style={{ background: "var(--color-primary)" }}
              />
              More
            </div>
          </div>
          <div className={styles.heatmapGrid}>
            <span />
            {HEATMAP_BUCKET_LABELS.map((label) => (
              <span key={label} className={styles.heatHour}>
                {label}
              </span>
            ))}
            {HEATMAP_DAY_LABELS.map((day, dayIndex) => (
              <HeatmapRow
                key={day}
                day={day}
                dayIndex={dayIndex}
                cells={data.heatmap.cells}
              />
            ))}
          </div>
          {data.heatmap.peakLabel ? (
            <div className={styles.heatmapFootnote}>
              Clear evening peak —{" "}
              <span className={styles.heatmapFootnoteStrong}>
                {data.heatmap.peakLabel}
              </span>{" "}
              is your busiest window. Consider adding evening classes.
            </div>
          ) : (
            <div className={styles.heatmapFootnote}>
              No check-ins in this period to identify peak hours.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function HeatmapRow({
  day,
  dayIndex,
  cells,
}: {
  day: string;
  dayIndex: number;
  cells: ReportsData["heatmap"]["cells"];
}) {
  const byBucket = new Map(
    cells
      .filter((c) => c.dayIndex === dayIndex)
      .map((c) => [c.bucketIndex, c] as const),
  );

  return (
    <>
      <span className={styles.heatDay}>{day}</span>
      {Array.from({ length: 8 }, (_, bucketIndex) => {
        const cell = byBucket.get(bucketIndex);
        return (
          <div
            key={`${dayIndex}-${bucketIndex}`}
            className={`${styles.heatCell} ${heatClass(cell?.intensity ?? 0)}`}
            title={cell ? `${cell.count} check-ins` : "0"}
          />
        );
      })}
    </>
  );
}

export function ReportsSkeleton() {
  return (
    <div className={styles.page}>
      <div
        className={`${styles.skeletonBlock} ${styles.skeletonTitle}`}
      />
      <div className={`${styles.skeletonBlock} ${styles.skeletonSub}`} />
      <div className={styles.kpiGrid}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonKpi}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonKpi}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonKpi}`} />
      </div>
      <div className={styles.donutGrid}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonDonut}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonDonut}`} />
      </div>
      <div className={styles.midGrid}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonMid}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonMid}`} />
      </div>
      <div className={`${styles.skeletonBlock} ${styles.skeletonHeat}`} />
    </div>
  );
}
