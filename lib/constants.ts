import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  ContactRound,
  CalendarCheck,
  Wallet,
  Package,
  Receipt,
  Boxes,
  CreditCard,
  BarChart3,
  Settings,
} from "lucide-react";

/** @deprecated Prefer DEFAULT_THEME from @/lib/theme/tokens — kept for existing imports */
export { DEFAULT_THEME as BRAND } from "@/lib/theme/tokens";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  key: string;
};

/** Order matches designfiles/Sidebar.dc.html */
export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "members", label: "Members", href: "/dashboard/members", icon: Users },
  { key: "staff", label: "Staff", href: "/dashboard/staff", icon: ContactRound },
  { key: "attendance", label: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
  { key: "fees", label: "Fees", href: "/dashboard/fees", icon: Wallet },
  { key: "inventory", label: "Inventory", href: "/dashboard/inventory", icon: Package },
  { key: "expenses", label: "Expenses", href: "/dashboard/expenses", icon: Receipt },
  { key: "packages", label: "Packages", href: "/dashboard/packages", icon: Boxes },
  { key: "cards", label: "Cards", href: "/dashboard/cards", icon: CreditCard },
  { key: "reports", label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { key: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings },
];
