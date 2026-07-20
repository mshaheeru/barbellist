import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getStaffById } from "@/app/actions/staff";
import { createClient } from "@/lib/supabase/server";
import {
  canManageStaff,
  canRecordSalary,
  canViewSalary,
} from "@/lib/auth/permissions";
import type { StaffRole } from "@/lib/types";
import { StaffProfileHero } from "./staff-profile-hero";
import {
  StaffProfileTabsNav,
  type StaffProfileTab,
} from "./staff-profile-tabs";
import { StaffOverviewTab } from "./tabs/overview-tab";
import { StaffAttendanceTab } from "./tabs/attendance-tab";
import { SalaryHistoryTab } from "./tabs/salary-history-tab";
import { StaffNotesTab } from "./tabs/notes-tab";
import { StaffQuickActions } from "./staff-quick-actions";
import styles from "./staff-profile.module.css";

const VALID_TABS: StaffProfileTab[] = [
  "overview",
  "attendance",
  "salary",
  "notes",
];

type StaffProfileContentProps = {
  id: string;
  tab: string | undefined;
};

async function getProfileContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.user_metadata?.role as StaffRole | undefined) ?? null;
  const gymId = user?.user_metadata?.gym_id as string | undefined;

  let currencySymbol = "Rs.";
  if (gymId) {
    const { data } = await supabase
      .from("gyms")
      .select("currency_symbol")
      .eq("id", gymId)
      .maybeSingle();
    currencySymbol = data?.currency_symbol ?? "Rs.";
  }

  return {
    role,
    currencySymbol,
    canManage: canManageStaff(role),
    canViewSalary: canViewSalary(role),
    canRecordSalary: canRecordSalary(role),
  };
}

export async function StaffProfileContent({
  id,
  tab: tabRaw,
}: StaffProfileContentProps) {
  const ctx = await getProfileContext();
  let activeTab: StaffProfileTab = VALID_TABS.includes(tabRaw as StaffProfileTab)
    ? (tabRaw as StaffProfileTab)
    : "overview";

  if (activeTab === "salary" && !ctx.canViewSalary) {
    activeTab = "overview";
  }

  const { data: staff, error } = await getStaffById(id);

  if (error || !staff) {
    notFound();
  }

  return (
    <>
      <StaffProfileHero staff={staff} />
      <Suspense
        fallback={
          <div
            className={styles.tabsSkel}
            aria-busy="true"
            aria-label="Loading tabs"
          />
        }
      >
        <StaffProfileTabsNav
          activeTab={activeTab}
          showSalary={ctx.canViewSalary}
        />
      </Suspense>

      <div className={styles.contentGrid}>
        <div className={styles.contentMain}>
          {activeTab === "overview" ? (
            <StaffOverviewTab
              staff={staff}
              currencySymbol={ctx.currencySymbol}
              canViewSalary={ctx.canViewSalary}
            />
          ) : null}
          {activeTab === "attendance" ? (
            <StaffAttendanceTab staff={staff} />
          ) : null}
          {activeTab === "salary" && ctx.canViewSalary ? (
            <SalaryHistoryTab
              staff={staff}
              currencySymbol={ctx.currencySymbol}
            />
          ) : null}
          {activeTab === "notes" ? (
            <StaffNotesTab
              staffId={staff.id}
              initialNotes={staff.notes_list}
            />
          ) : null}
        </div>

        {activeTab === "overview" ? (
          <StaffQuickActions
            staff={staff}
            currencySymbol={ctx.currencySymbol}
            canManage={ctx.canManage}
            canRecordSalary={ctx.canRecordSalary}
          />
        ) : null}
      </div>
    </>
  );
}
