import type { StaffRole } from "@/lib/types";

const PAYMENT_ROLES: StaffRole[] = ["owner", "manager", "cashier"];
const READ_ONLY_FEES_ROLES: StaffRole[] = ["trainer", "cleaner"];
const GENERATE_DUES_ROLES: StaffRole[] = ["owner", "manager"];

export function canRecordPayment(role: StaffRole | null): boolean {
  if (!role) return false;
  return PAYMENT_ROLES.includes(role);
}

export function canWaiveFee(role: StaffRole | null): boolean {
  return role === "owner";
}

export function canSendReminder(role: StaffRole | null): boolean {
  return canRecordPayment(role);
}

export function canGenerateMonthlyDues(role: StaffRole | null): boolean {
  if (!role) return false;
  return GENERATE_DUES_ROLES.includes(role);
}

export function isFeesReadOnly(role: StaffRole | null): boolean {
  if (!role) return true;
  return READ_ONLY_FEES_ROLES.includes(role);
}

/** Check in members / other staff / QR kiosk scans */
const CHECK_IN_OTHERS_ROLES: StaffRole[] = ["owner", "manager", "cashier"];

export function canCheckIn(role: StaffRole | null): boolean {
  if (!role) return false;
  return CHECK_IN_OTHERS_ROLES.includes(role);
}

/** Trainer / cleaner may clock themselves in only */
export function canCheckInSelf(role: StaffRole | null): boolean {
  if (!role) return false;
  return (
    CHECK_IN_OTHERS_ROLES.includes(role) ||
    role === "trainer" ||
    role === "cleaner"
  );
}

export function canViewAttendanceFeed(role: StaffRole | null): boolean {
  return role !== null;
}

const MANAGE_STAFF_ROLES: StaffRole[] = ["owner", "manager"];
const STAFF_DIRECTORY_ROLES: StaffRole[] = ["owner", "manager", "cashier"];

export function canManageStaff(role: StaffRole | null): boolean {
  if (!role) return false;
  return MANAGE_STAFF_ROLES.includes(role);
}

export function canViewSalary(role: StaffRole | null): boolean {
  return role === "owner";
}

export function canViewStaffDirectory(role: StaffRole | null): boolean {
  if (!role) return false;
  return STAFF_DIRECTORY_ROLES.includes(role);
}

export function canRecordSalary(role: StaffRole | null): boolean {
  return role === "owner";
}

const MANAGE_EXPENSES_ROLES: StaffRole[] = ["owner", "manager"];
const MANAGE_INVENTORY_ROLES: StaffRole[] = ["owner", "manager"];
const RECORD_SALE_ROLES: StaffRole[] = ["owner", "manager", "cashier"];

export function canManageExpenses(role: StaffRole | null): boolean {
  if (!role) return false;
  return MANAGE_EXPENSES_ROLES.includes(role);
}

export function canRecordExpense(role: StaffRole | null): boolean {
  return canManageExpenses(role);
}

export function canManageInventory(role: StaffRole | null): boolean {
  if (!role) return false;
  return MANAGE_INVENTORY_ROLES.includes(role);
}

export function canRecordSale(role: StaffRole | null): boolean {
  if (!role) return false;
  return RECORD_SALE_ROLES.includes(role);
}

export function canViewInventory(role: StaffRole | null): boolean {
  return canRecordSale(role);
}

const MANAGE_PACKAGES_ROLES: StaffRole[] = ["owner", "manager"];

export function canManagePackages(role: StaffRole | null): boolean {
  if (!role) return false;
  return MANAGE_PACKAGES_ROLES.includes(role);
}

const ACCESS_SETTINGS_ROLES: StaffRole[] = ["owner", "manager"];

export function canAccessSettings(role: StaffRole | null): boolean {
  if (!role) return false;
  return ACCESS_SETTINGS_ROLES.includes(role);
}

export function canViewBilling(role: StaffRole | null): boolean {
  return role === "owner";
}

export function canAccessDangerZone(role: StaffRole | null): boolean {
  return role === "owner";
}

export function canEditWhatsAppCredentials(role: StaffRole | null): boolean {
  return role === "owner";
}

export type DashboardVisibility = {
  showMembers: boolean;
  showRevenue: boolean;
  showExpenses: boolean;
  showProfit: boolean;
  showProfitValue: boolean;
  showOverdue: boolean;
  showChart: boolean;
  showExpenseBreakdown: boolean;
  showFeeAlerts: boolean;
  showAtRisk: boolean;
  showExpiring: boolean;
  showAttendanceStats: boolean;
};

/** Owner + manager only — Prompt 14 cashier matrix excludes reports */
const VIEW_REPORTS_ROLES: StaffRole[] = ["owner", "manager"];

export function canViewReports(role: StaffRole | null): boolean {
  if (!role) return false;
  return VIEW_REPORTS_ROLES.includes(role);
}

export type ReportsVisibility = {
  showRevenue: boolean;
  showNewVsChurned: boolean;
  showRetention: boolean;
  showPackages: boolean;
  showPaymentMethods: boolean;
  showProfit: boolean;
  showProfitValue: boolean;
  showExpenses: boolean;
  showHeatmap: boolean;
  canExport: boolean;
};

export function getReportsVisibility(
  role: StaffRole | null,
): ReportsVisibility {
  if (role === "owner") {
    return {
      showRevenue: true,
      showNewVsChurned: true,
      showRetention: true,
      showPackages: true,
      showPaymentMethods: true,
      showProfit: true,
      showProfitValue: true,
      showExpenses: true,
      showHeatmap: true,
      canExport: true,
    };
  }

  if (role === "manager") {
    return {
      showRevenue: true,
      showNewVsChurned: true,
      showRetention: true,
      showPackages: true,
      showPaymentMethods: true,
      showProfit: true,
      showProfitValue: false,
      showExpenses: true,
      showHeatmap: true,
      canExport: true,
    };
  }

  return {
    showRevenue: false,
    showNewVsChurned: false,
    showRetention: false,
    showPackages: false,
    showPaymentMethods: false,
    showProfit: false,
    showProfitValue: false,
    showExpenses: false,
    showHeatmap: false,
    canExport: false,
  };
}

export function getDashboardVisibility(
  role: StaffRole | null,
): DashboardVisibility {
  if (role === "owner") {
    return {
      showMembers: true,
      showRevenue: true,
      showExpenses: true,
      showProfit: true,
      showProfitValue: true,
      showOverdue: true,
      showChart: true,
      showExpenseBreakdown: true,
      showFeeAlerts: true,
      showAtRisk: true,
      showExpiring: true,
      showAttendanceStats: false,
    };
  }

  if (role === "manager") {
    return {
      showMembers: true,
      showRevenue: true,
      showExpenses: true,
      showProfit: true,
      showProfitValue: false,
      showOverdue: true,
      showChart: true,
      showExpenseBreakdown: true,
      showFeeAlerts: true,
      showAtRisk: true,
      showExpiring: true,
      showAttendanceStats: false,
    };
  }

  if (role === "cashier") {
    return {
      showMembers: true,
      showRevenue: true,
      showExpenses: false,
      showProfit: false,
      showProfitValue: false,
      showOverdue: true,
      showChart: true,
      showExpenseBreakdown: false,
      showFeeAlerts: true,
      showAtRisk: true,
      showExpiring: true,
      showAttendanceStats: false,
    };
  }

  // trainer / cleaner / unknown
  return {
    showMembers: true,
    showRevenue: false,
    showExpenses: false,
    showProfit: false,
    showProfitValue: false,
    showOverdue: false,
    showChart: false,
    showExpenseBreakdown: false,
    showFeeAlerts: false,
    showAtRisk: false,
    showExpiring: false,
    showAttendanceStats: true,
  };
}

/**
 * Sidebar nav visibility per Prompt 14 role matrix.
 * Staff key is visible for own-profile access even when directory is hidden.
 */
export function canAccessNavKey(
  role: StaffRole | null,
  key: string,
): boolean {
  if (!role) return false;

  if (role === "owner" || role === "manager") {
    return true;
  }

  if (role === "cashier") {
    return (
      key === "dashboard" ||
      key === "members" ||
      key === "fees" ||
      key === "attendance" ||
      key === "inventory" ||
      key === "staff"
    );
  }

  if (role === "trainer") {
    return (
      key === "dashboard" ||
      key === "members" ||
      key === "attendance" ||
      key === "staff"
    );
  }

  if (role === "cleaner") {
    return key === "dashboard" || key === "attendance" || key === "staff";
  }

  return false;
}
