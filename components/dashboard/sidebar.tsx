"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { canAccessNavKey } from "@/lib/auth/permissions";
import { BarbellMark } from "@/components/auth/barbell-mark";
import { getInitials, useGym } from "@/components/gym-provider";
import styles from "./sidebar.module.css";

type SidebarProps = {
  mobileOpen?: boolean;
  onNavigate?: () => void;
};

function navKeyFromPath(pathname: string) {
  if (pathname === "/dashboard" || pathname === "/dashboard/") return "dashboard";
  const match = NAV_ITEMS.find(
    (item) => item.href !== "/dashboard" && pathname.startsWith(item.href),
  );
  return match?.key ?? "dashboard";
}

export function DashboardSidebar({
  mobileOpen = false,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const active = navKeyFromPath(pathname);
  const { staffName, gymName, role } = useGym();
  const initials = getInitials(staffName);
  const roleLabel = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "Staff";

  const visibilityClass = mobileOpen
    ? styles.sidebarMobileOpen
    : styles.sidebarMobileHidden;

  return (
    <aside className={`${styles.sidebar} ${visibilityClass}`}>
      <div className={styles.brandRow}>
        <div className={styles.brandMark}>
          <BarbellMark size={21} stroke="#C9861B" />
        </div>
        <span className={styles.brandName}>Barbellist</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.filter((item) => canAccessNavKey(role, item.key)).map(
          (item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onNavigate}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                <Icon size={18} strokeWidth={1.9} />
                {item.label}
              </Link>
            );
          },
        )}
      </nav>

      <div className={styles.userChip}>
        <div className={styles.userAvatar}>{initials}</div>
        <div className={styles.userMeta}>
          <div className={styles.userName}>{staffName ?? "Loading…"}</div>
          <div className={styles.userRole}>
            {roleLabel}
            {gymName ? ` · ${gymName}` : ""}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileSidebarOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className={styles.mobileOverlay}>
      <button
        type="button"
        className={styles.mobileBackdrop}
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className={styles.mobileDrawer}>
        <DashboardSidebar mobileOpen onNavigate={onClose} />
      </div>
    </div>
  );
}
