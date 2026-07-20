import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  canManageStaff,
  canViewSalary,
  canViewStaffDirectory,
} from "@/lib/auth/permissions";
import type { StaffRole } from "@/lib/types";
import { StaffList, StaffPageHeader } from "@/components/staff/staff-list";
import {
  StaffPageHeaderSkeleton,
  StaffTableSkeleton,
} from "@/components/staff/staff-skeletons";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    filter?: string;
    sort?: string;
  }>;
};

async function getPageContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.user_metadata?.role as StaffRole | undefined) ?? null;
  const gymId = user?.user_metadata?.gym_id as string | undefined;

  let currencySymbol = "Rs.";
  let staffId: string | null = null;

  if (user) {
    const { data: staffRow } = await supabase
      .from("staff")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    staffId = staffRow?.id ?? null;
  }

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
    staffId,
    currencySymbol,
    canManage: canManageStaff(role),
    canViewSalary: canViewSalary(role),
    canViewDirectory: canViewStaffDirectory(role),
  };
}

export default async function StaffPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const ctx = await getPageContext();

  if (!ctx.canViewDirectory) {
    if (ctx.staffId) {
      redirect(`/dashboard/staff/${ctx.staffId}`);
    }
    redirect("/dashboard");
  }

  return (
    <>
      <Suspense fallback={<StaffPageHeaderSkeleton />}>
        <StaffPageHeader
          canManage={ctx.canManage}
          canViewSalary={ctx.canViewSalary}
          currencySymbol={ctx.currencySymbol}
        />
      </Suspense>

      <Suspense fallback={<StaffTableSkeleton />}>
        <StaffList
          search={params.q}
          filter={params.filter}
          sort={params.sort}
          currencySymbol={ctx.currencySymbol}
          canViewSalary={ctx.canViewSalary}
        />
      </Suspense>
    </>
  );
}
