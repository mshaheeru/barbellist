"use client";

import { Bell, Menu, Plus } from "lucide-react";
import { useGym } from "@/components/gym-provider";
import { useOpenMobileMenu } from "@/components/mobile-menu-context";

type TopBarProps = {
  onMenuClick?: () => void;
  title?: string;
  subtitle?: string;
  showAddMember?: boolean;
};

function formatToday() {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function firstName(name: string | null) {
  if (!name) return "there";
  return name.trim().split(/\s+/)[0] ?? "there";
}

export function TopBar({
  onMenuClick,
  title,
  subtitle,
  showAddMember = false,
}: TopBarProps) {
  const { staffName, gymName } = useGym();
  const openMobileMenu = useOpenMobileMenu();
  const handleMenu = onMenuClick ?? openMobileMenu;
  const greeting = title ?? `Assalam-o-Alaikum, ${firstName(staffName)}`;
  const sub =
    subtitle ??
    `${formatToday()} · Here's how ${gymName ?? "your gym"} is doing today.`;

  return (
    <div className="mb-[26px] flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <button
          type="button"
          onClick={handleMenu}
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border border-[#EAE4D8] bg-white text-[#4A4A42] md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {greeting}
          </h1>
          <p className="mt-[3px] text-[14.5px] text-[#7A7A70]">{sub}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <button
          type="button"
          className="relative flex h-[42px] w-[42px] items-center justify-center rounded-[11px] border border-[#EAE4D8] bg-white text-[#4A4A42]"
          aria-label="Notifications"
        >
          <Bell size={19} strokeWidth={1.9} />
          <span className="absolute top-[9px] right-[11px] h-[7px] w-[7px] rounded-full border-2 border-white bg-[#C0392B]" />
        </button>

        {showAddMember ? (
          <button
            type="button"
            className="hidden items-center gap-[9px] rounded-[11px] bg-primary px-[18px] py-[11px] text-sm font-semibold text-white shadow-[0_4px_12px_rgba(27,94,60,0.24)] sm:inline-flex"
          >
            <Plus size={17} strokeWidth={2.2} />
            Add Member
          </button>
        ) : null}
      </div>
    </div>
  );
}
