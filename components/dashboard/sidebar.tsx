"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronUp, LogOut } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { canAccessNavKey } from "@/lib/auth/permissions";
import { LogoLockupReversed } from "@/components/brand/logo";
import { getInitials, useGym } from "@/components/gym-provider";
import { createClient } from "@/lib/supabase/client";
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
  const router = useRouter();
  const active = navKeyFromPath(pathname);
  const { staffName, gymName, role } = useGym();
  const initials = getInitials(staffName);
  const roleLabel = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "Staff";
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setMenuOpen(false);
      onNavigate?.();
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const visibilityClass = mobileOpen
    ? styles.sidebarMobileOpen
    : styles.sidebarMobileHidden;

  return (
    <aside className={`${styles.sidebar} ${visibilityClass}`}>
      <div className={styles.brandRow}>
        <LogoLockupReversed height={30} href="/dashboard" />
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

      <div className={styles.userMenu} ref={menuRef}>
        {menuOpen ? (
          <div className={styles.userDropdown} role="menu">
            <button
              type="button"
              role="menuitem"
              className={styles.userDropdownItem}
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut size={15} strokeWidth={2} />
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        ) : null}
        <button
          type="button"
          className={styles.userChip}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <div className={styles.userAvatar}>{initials}</div>
          <div className={styles.userMeta}>
            <div className={styles.userName}>{staffName ?? "Loading…"}</div>
            <div className={styles.userRole}>
              {roleLabel}
              {gymName ? ` · ${gymName}` : ""}
            </div>
          </div>
          <ChevronUp
            size={16}
            strokeWidth={2}
            className={`${styles.userChevron} ${menuOpen ? styles.userChevronOpen : ""}`}
            aria-hidden
          />
        </button>
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
