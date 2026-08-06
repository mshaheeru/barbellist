import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSettingsPageData } from "@/app/actions/settings";
import {
  SettingsPage,
  SettingsSkeleton,
} from "@/components/settings/settings-page";
import { canAccessSettings } from "@/lib/auth/permissions";
import { getUserRole } from "@/lib/auth/claims";
import { createClient } from "@/lib/supabase/server";
import styles from "@/components/settings/settings.module.css";

export const dynamic = "force-dynamic";

async function SettingsContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = getUserRole(user);

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
