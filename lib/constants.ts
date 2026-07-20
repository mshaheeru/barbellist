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

export const BRAND = {
  primary: "#1B5E3C",
  accent: "#C9861B",
  background: "#FAF7F2",
  foreground: "#1F1F1F",
  muted: "#E8E5DF",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  sidebar: "#123D28",
  sidebarActive: "#1B5E3C",
  sidebarMuted: "#A9C4B4",
  sidebarSubtle: "#88A596",
} as const;

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
