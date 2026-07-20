"use client";

import { useState, type ReactNode } from "react";
import { GymProvider } from "@/components/gym-provider";
import {
  DashboardSidebar,
  MobileSidebarOverlay,
} from "@/components/dashboard/sidebar";
import { MobileMenuContext } from "@/components/mobile-menu-context";
import shellStyles from "@/components/dashboard/dashboard-shell.module.css";

function DashboardShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const openMenu = () => setMobileOpen(true);

  return (
    <MobileMenuContext.Provider value={openMenu}>
      <div className={shellStyles.shell}>
        <DashboardSidebar />
        <MobileSidebarOverlay
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
        <main className={shellStyles.main}>{children}</main>
      </div>
    </MobileMenuContext.Provider>
  );
}

export function DashboardLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <GymProvider>
      <DashboardShell>{children}</DashboardShell>
    </GymProvider>
  );
}
