"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { Plus } from "lucide-react";
import { togglePackageActive } from "@/app/actions/packages";
import { PackageModal } from "@/components/modals/package-modal";
import { DeletePackageModal } from "@/components/modals/delete-package-modal";
import type { Package } from "@/lib/types";
import { PackageAdminCard } from "./package-admin-card";
import { PageHeaderStart } from "@/components/dashboard/page-header-start";
import { RoleGate } from "@/components/auth/role-gate";
import styles from "./packages.module.css";

type PackagesPageProps = {
  initialPackages: Package[];
  currencySymbol: string;
};

export function PackagesPage({
  initialPackages,
  currencySymbol,
}: PackagesPageProps) {
  const router = useRouter();
  const [packages, setPackages] = useState(initialPackages);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [deleting, setDeleting] = useState<Package | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setPackages(initialPackages);
  }, [initialPackages]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (pkg: Package) => {
    setEditing(pkg);
    setModalOpen(true);
  };

  const handleToggle = (pkg: Package) => {
    const next = !pkg.is_active;
    setPackages((prev) =>
      prev.map((p) => (p.id === pkg.id ? { ...p, is_active: next } : p)),
    );
    setTogglingId(pkg.id);

    startTransition(async () => {
      const { data, error } = await togglePackageActive(pkg.id);
      setTogglingId(null);
      if (error || !data) {
        setPackages((prev) =>
          prev.map((p) =>
            p.id === pkg.id ? { ...p, is_active: pkg.is_active } : p,
          ),
        );
        notifications.show({
          color: "red",
          message: error ?? "Failed to update package",
        });
        return;
      }
      setPackages((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      router.refresh();
    });
  };

  const handleSaved = (pkg: Package) => {
    setPackages((prev) => {
      const idx = prev.findIndex((p) => p.id === pkg.id);
      if (idx === -1) {
        return [...prev, pkg].sort(
          (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
        );
      }
      const next = [...prev];
      next[idx] = pkg;
      return next.sort(
        (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
      );
    });
    setModalOpen(false);
    setEditing(null);
    router.refresh();
  };

  const handleDeleted = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
    router.refresh();
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <PageHeaderStart
          title="Packages"
          titleClassName={styles.pageTitle}
          subtitleClassName={styles.pageSubtitle}
          subtitle={
            packages.length === 0
              ? "Membership tiers for onboarding"
              : `${packages.length} package${packages.length === 1 ? "" : "s"}`
          }
        />
        <RoleGate allow={["owner", "manager"]}>
          <button type="button" className={styles.addBtn} onClick={openAdd}>
            <Plus size={17} strokeWidth={2.2} />
            Add Package
          </button>
        </RoleGate>
      </div>

      {packages.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No packages yet</p>
          <p className={styles.emptyText}>
            Add your first package to start onboarding members.
          </p>
          <button type="button" className={styles.addBtn} onClick={openAdd}>
            <Plus size={17} strokeWidth={2.2} />
            Add Package
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {packages.map((pkg) => (
            <PackageAdminCard
              key={pkg.id}
              pkg={pkg}
              currencySymbol={currencySymbol}
              toggling={togglingId === pkg.id}
              onToggleActive={() => handleToggle(pkg)}
              onEdit={() => openEdit(pkg)}
              onDelete={() => setDeleting(pkg)}
            />
          ))}
        </div>
      )}

      <PackageModal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        package={editing}
        currencySymbol={currencySymbol}
        onSaved={handleSaved}
      />

      <DeletePackageModal
        opened={!!deleting}
        onClose={() => setDeleting(null)}
        package={deleting}
        onDeleted={handleDeleted}
      />
    </>
  );
}

export function PackagesSkeleton() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Packages</h1>
          <p className={styles.pageSubtitle}>Loading…</p>
        </div>
      </div>
      <div className={styles.skeletonGrid}>
        <div className={styles.skeletonCard} />
        <div className={styles.skeletonCard} />
        <div className={styles.skeletonCard} />
      </div>
    </>
  );
}
