import { Suspense } from "react";
import Link from "next/link";
import { getPackagesForGym } from "@/app/actions/members";
import { OnboardingWizard } from "@/components/members/onboarding/onboarding-wizard";
import styles from "@/components/members/members.module.css";

export const dynamic = "force-dynamic";

function NewMemberFallback() {
  return (
    <div className="space-y-4 p-2" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-56 animate-pulse rounded bg-[#E8E4DC]" />
      <div className="h-4 w-72 animate-pulse rounded bg-[#E8E4DC]" />
      <div className="mt-6 h-64 w-full animate-pulse rounded-lg bg-[#E8E4DC]" />
    </div>
  );
}

async function NewMemberContent() {
  const { data: packages, error } = await getPackagesForGym();

  if (error || !packages) {
    return (
      <div className={styles.errorBox}>
        {error ?? "Failed to load packages. Please try again."}
        <div style={{ marginTop: 16 }}>
          <Link href="/dashboard/members" className={styles.addBtn}>
            Back to Members
          </Link>
        </div>
      </div>
    );
  }

  return <OnboardingWizard packages={packages} />;
}

export default function NewMemberPage() {
  return (
    <Suspense fallback={<NewMemberFallback />}>
      <NewMemberContent />
    </Suspense>
  );
}
