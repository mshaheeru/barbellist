"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const active = navKeyFromPath(pathname);
  const { staffName, gymName, role, gym, freezeForLogout } = useGym();

  // Freeze last-known shell data so logout never empties the sidebar first.
  const lastShellRef = useRef<{
    logoUrl: string | null;
    name: string | null;
    role: typeof role;
    staffName: string | null;
  }>({
    logoUrl: null,
    name: null,
    role: null,
    staffName: null,
  });
  if (gym || role || staffName) {
    lastShellRef.current = {
      logoUrl: gym?.logo_url ?? lastShellRef.current.logoUrl,
      name: gym?.name ?? gymName ?? lastShellRef.current.name,
      role: role ?? lastShellRef.current.role,
      staffName: staffName ?? lastShellRef.current.staffName,
    };
  }
  const displayLogo = gym?.logo_url ?? lastShellRef.current.logoUrl;
  const displayName = gymName ?? lastShellRef.current.name;
  const displayRole = role ?? lastShellRef.current.role;
  const displayStaffName = staffName ?? lastShellRef.current.staffName;
  const initials = getInitials(displayStaffName);
  const roleLabel = displayRole
    ? displayRole.charAt(0).toUpperCase() + displayRole.slice(1)
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
    freezeForLogout();
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      // Full document navigation — keeps the current shell painted until /login loads.
      window.location.replace("/login");
    } catch {
      window.location.replace("/login");
    }
  }

  const visibilityClass = mobileOpen
    ? styles.sidebarMobileOpen
    : styles.sidebarMobileHidden;

  return (
    <aside className={`${styles.sidebar} ${visibilityClass}`}>
      <div className={styles.brandRow}>
        {displayLogo ? (
          <Link
            href="/dashboard"
            className={styles.gymLogoLink}
            onClick={onNavigate}
            aria-label={displayName ?? "Dashboard"}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayLogo}
              alt=""
              className={styles.gymLogo}
            />
            {displayName ? (
              <span className={styles.brandName}>{displayName}</span>
            ) : null}
          </Link>
        ) : (
          <LogoLockupReversed height={30} href="/dashboard" />
        )}
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.filter((item) => canAccessNavKey(displayRole, item.key)).map(
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
            <div className={styles.userName}>
              {displayStaffName ?? "Loading…"}
            </div>
            <div className={styles.userRole}>
              {roleLabel}
              {displayName ? ` · ${displayName}` : ""}
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
