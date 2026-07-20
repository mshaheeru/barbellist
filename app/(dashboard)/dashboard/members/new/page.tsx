import Link from "next/link";
import { getPackagesForGym } from "@/app/actions/members";
import { OnboardingWizard } from "@/components/members/onboarding/onboarding-wizard";
import styles from "@/components/members/members.module.css";

export default async function NewMemberPage() {
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
