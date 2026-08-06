import { redirect } from "next/navigation";
import { Suspense } from "react";
import { listPackages } from "@/app/actions/packages";
import {
  PackagesPage,
  PackagesSkeleton,
} from "@/components/packages/packages-page";
import { canManagePackages } from "@/lib/auth/permissions";
import { getUserGymId, getUserRole } from "@/lib/auth/claims";
import { createClient } from "@/lib/supabase/server";
import styles from "@/components/packages/packages.module.css";

export const dynamic = "force-dynamic";

async function PackagesContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = getUserRole(user);
  const gymId = getUserGymId(user);

  if (!canManagePackages(role)) {
    redirect("/dashboard");
  }

  const [{ data, error }, gymRes] = await Promise.all([
    listPackages(),
    gymId
      ? supabase
          .from("gyms")
          .select("currency_symbol")
          .eq("id", gymId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (error) {
    return <div className={styles.errorBox}>{error}</div>;
  }

  const currencySymbol = gymRes.data?.currency_symbol ?? "Rs.";

  return (
    <PackagesPage
      initialPackages={data ?? []}
      currencySymbol={currencySymbol}
    />
  );
}

export default function PackagesRoute() {
  return (
    <Suspense fallback={<PackagesSkeleton />}>
      <PackagesContent />
    </Suspense>
  );
}
