import type { DashboardVisibility } from "@/lib/auth/permissions";

export type DashboardKpis = {
  activeMembers: number;
  newMembersThisMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueTrendPercent: number | null;
  expensesThisMonth: number | null;
  expensesLastMonth: number | null;
  expensesTrendPercent: number | null;
  profitThisMonth: number | null;
  profitLastMonth: number | null;
  profitTrendPercent: number | null;
  overdueBalance: number;
  overdueMemberCount: number;
  monthLabel: string;
  lastMonthLabel: string;
  checkInsToday: number | null;
};

export type DashboardChartPoint = {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
};

export type DashboardExpenseBar = {
  category: string;
  label: string;
  amount: number;
  widthPercent: number;
  tone: "amber" | "green";
};

export type DashboardFeeAlert = {
  feeDueId: string;
  memberId: string;
  name: string;
  initials: string;
  tone: "green" | "amber";
  photoUrl: string | null;
  phone: string | null;
  packageName: string | null;
  balance: number;
  daysOverdue: number;
};

export type DashboardAtRiskMember = {
  memberId: string;
  name: string;
  initials: string;
  tone: "green" | "amber";
  photoUrl: string | null;
  phone: string | null;
  daysAbsent: number;
};

export type DashboardExpiringMember = {
  memberId: string;
  name: string;
  initials: string;
  tone: "green" | "amber";
  photoUrl: string | null;
  packageName: string | null;
  daysLeft: number;
};

export type DashboardData = {
  visibility: DashboardVisibility;
  kpis: DashboardKpis;
  chart: DashboardChartPoint[];
  expenseBreakdown: DashboardExpenseBar[];
  feeAlerts: DashboardFeeAlert[];
  atRisk: DashboardAtRiskMember[];
  expiring: DashboardExpiringMember[];
};
