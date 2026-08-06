import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getMemberById } from "@/app/actions/members";
import { getUserGymId } from "@/lib/auth/claims";
import { createClient } from "@/lib/supabase/server";
import { MemberProfileHero } from "@/components/members/member-profile-hero";
import {
  MemberProfileTabsNav,
  type ProfileTab,
} from "@/components/members/member-profile-tabs";
import { QuickActionsSidebar } from "@/components/members/quick-actions-sidebar";
import { OverviewTab } from "@/components/members/tabs/overview-tab";
import { AttendanceTab } from "@/components/members/tabs/attendance-tab";
import { PaymentsTab } from "@/components/members/tabs/payments-tab";
import { ProgressTab } from "@/components/members/tabs/progress-tab";
import { NotesTab } from "@/components/members/tabs/notes-tab";
import styles from "@/components/members/member-profile.module.css";

const VALID_TABS: ProfileTab[] = [
  "overview",
  "attendance",
  "payments",
  "progress",
  "notes",
];

type MemberProfileContentProps = {
  id: string;
  tab: string | undefined;
};

async function getCurrencySymbol() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const gymId = getUserGymId(user);
  if (!gymId) return "Rs.";

  const { data } = await supabase
    .from("gyms")
    .select("currency_symbol")
    .eq("id", gymId)
    .maybeSingle();

  return data?.currency_symbol ?? "Rs.";
}

export async function MemberProfileContent({
  id,
  tab: tabRaw,
}: MemberProfileContentProps) {
  const activeTab: ProfileTab = VALID_TABS.includes(tabRaw as ProfileTab)
    ? (tabRaw as ProfileTab)
    : "overview";

  const [{ data: member, error }, currencySymbol] = await Promise.all([
    getMemberById(id),
    getCurrencySymbol(),
  ]);

  if (error || !member) {
    notFound();
  }

  return (
    <>
      <MemberProfileHero member={member} />
      <Suspense
        fallback={
          <div
            className={styles.tabsSkel}
            aria-busy="true"
            aria-label="Loading tabs"
          />
        }
      >
        <MemberProfileTabsNav activeTab={activeTab} />
      </Suspense>

      <div className={styles.contentGrid}>
        <div className={styles.contentMain}>
          {activeTab === "overview" ? (
            <OverviewTab member={member} currencySymbol={currencySymbol} />
          ) : null}
          {activeTab === "attendance" ? (
            <AttendanceTab member={member} />
          ) : null}
          {activeTab === "payments" ? (
            <PaymentsTab member={member} currencySymbol={currencySymbol} />
          ) : null}
          {activeTab === "progress" ? (
            <ProgressTab member={member} />
          ) : null}
          {activeTab === "notes" ? (
            <NotesTab memberId={member.id} initialNotes={member.notes_list} />
          ) : null}
        </div>

        {activeTab === "overview" ? (
          <QuickActionsSidebar member={member} />
        ) : null}
      </div>
    </>
  );
}
