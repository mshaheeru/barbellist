import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSettingsPageData } from "@/app/actions/settings";
import {
  SettingsPage,
  SettingsSkeleton,
} from "@/components/settings/settings-page";
import { canAccessSettings } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import type { StaffRole } from "@/lib/types";
import styles from "@/components/settings/settings.module.css";

async function SettingsContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.user_metadata?.role as StaffRole | undefined) ?? null;

  if (!canAccessSettings(role)) {
    redirect("/dashboard");
  }

  const { data, error } = await getSettingsPageData();

  if (error || !data) {
    return (
      <div className={styles.errorBox}>
        {error ?? "Failed to load settings."}
      </div>
    );
  }

  return <SettingsPage initial={data} />;
}

export default function SettingsRoute() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}
