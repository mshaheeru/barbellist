"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { getInitials, useGym } from "@/components/gym-provider";

type SidebarProps = {
  mobileOpen?: boolean;
  onNavigate?: () => void;
};

function BarbellLogo() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C9861B"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect
        x="2"
        y="14"
        width="4"
        height="8"
        rx="1.2"
        transform="rotate(-45 4 18)"
      />
      <rect
        x="18"
        y="2"
        width="4"
        height="8"
        rx="1.2"
        transform="rotate(-45 20 6)"
      />
      <path d="M6.5 6.5l11 11" />
    </svg>
  );
}

function navKeyFromPath(pathname: string) {
  if (pathname === "/dashboard" || pathname === "/dashboard/") return "dashboard";
  const match = NAV_ITEMS.find(
    (item) => item.href !== "/dashboard" && pathname.startsWith(item.href),
  );
  return match?.key ?? "dashboard";
}

export function Sidebar({ mobileOpen = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const active = navKeyFromPath(pathname);
  const { staffName, gymName, role } = useGym();
  const initials = getInitials(staffName);
  const roleLabel = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "Staff";

  return (
    <aside
      className={`flex h-full w-[248px] shrink-0 flex-col bg-sidebar py-[22px] ${
        mobileOpen ? "flex" : "hidden md:flex"
      }`}
    >
      <div className="mb-5 flex items-center gap-[11px] px-6">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-primary">
          <BarbellLogo />
        </div>
        <span className="text-[19px] font-bold tracking-tight text-white">
          Barbellist
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-[10px] px-3.5 py-[9.5px] text-sm no-underline transition-colors ${
                isActive
                  ? "bg-sidebar-active font-semibold text-white"
                  : "bg-transparent font-medium text-sidebar-muted hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} strokeWidth={1.9} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3.5 mt-2 flex items-center gap-[11px] rounded-xl bg-white/[0.06] px-3.5 py-[11px]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-semibold text-white">
            {staffName ?? "Loading…"}
          </div>
          <div className="truncate text-[11.5px] text-sidebar-subtle">
            {roleLabel}
            {gymName ? ` · ${gymName}` : ""}
          </div>
        </div>
      </div>
    </aside>
  );
}
