import type { ReportsVisibility } from "@/lib/auth/permissions";

/** Heatmap hour buckets matching design: 6a, 8a, 10a, 12p, 2p, 4p, 6p, 8p */
export const HEATMAP_BUCKET_LABELS = [
  "6a",
  "8a",
  "10a",
  "12p",
  "2p",
  "4p",
  "6p",
  "8p",
] as const;

export const HEATMAP_DAY_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

export type ReportsDateRange = {
  from: string;
  to: string;
};

export type ReportsKpis = {
  revenueTotal: number;
  revenueTrendPercent: number | null;
  sparkline: number[];
  newMembers: number;
  churnedMembers: number;
  netMembers: number;
  avgRetentionMonths: number | null;
  retentionYoYDelta: number | null;
};

export type ReportsDonutSlice = {
  key: string;
  label: string;
  value: number;
  percent: number;
  color: string;
};

export type ReportsMonthPoint = {
  monthKey: string;
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  newMembers: number;
  churnedMembers: number;
  activeMembers: number;
};

export type ReportsExpenseBar = {
  category: string;
  label: string;
  amount: number;
  widthPercent: number;
  tone: "amber" | "green";
};

export type ReportsHeatmapCell = {
  dayIndex: number;
  bucketIndex: number;
  count: number;
  intensity: number;
};

export type ReportsHeatmap = {
  cells: ReportsHeatmapCell[];
  maxCount: number;
  peakLabel: string | null;
};

export type ReportsData = {
  range: ReportsDateRange;
  rangeLabel: string;
  visibility: ReportsVisibility;
  kpis: ReportsKpis;
  packageDistribution: ReportsDonutSlice[];
  packageMemberTotal: number;
  paymentMethods: ReportsDonutSlice[];
  profitTrend: ReportsMonthPoint[];
  profitAvgPerMonth: number | null;
  profitDeltaFromStart: number | null;
  expenseBreakdown: ReportsExpenseBar[];
  expenseTotal: number;
  heatmap: ReportsHeatmap;
};
