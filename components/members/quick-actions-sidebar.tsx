"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Pencil,
  Snowflake,
  Trash2,
  Wallet,
} from "lucide-react";
import type { MemberProfile } from "@/lib/types";
import { DeleteMemberModal } from "./modals/delete-member-modal";
import { EditMemberModal } from "./modals/edit-member-modal";
import { FreezeMembershipModal } from "./modals/freeze-membership-modal";
import { RecordPaymentModal } from "@/components/modals/record-payment-modal";
import styles from "./member-profile.module.css";

type QuickActionsSidebarProps = {
  member: MemberProfile;
};

export function QuickActionsSidebar({ member }: QuickActionsSidebarProps) {
  const router = useRouter();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className={`${styles.card} ${styles.quickActions}`}>
        <div className={styles.cardTitle}>Quick Actions</div>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
          onClick={() => setPaymentOpen(true)}
        >
          <Wallet size={17} strokeWidth={2} />
          Record Payment
        </button>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => setFreezeOpen(true)}
        >
          <Snowflake size={17} strokeWidth={2} />
          {member.status === "frozen" ? "Manage Freeze" : "Freeze Membership"}
        </button>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() =>
            router.push(`/dashboard/cards?member=${member.id}`)
          }
        >
          <CreditCard size={17} strokeWidth={2} />
          Reprint Card
        </button>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => setEditOpen(true)}
        >
          <Pencil size={17} strokeWidth={2} />
          Edit Details
        </button>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 size={17} strokeWidth={2} />
          Delete Member
        </button>
      </div>

      <RecordPaymentModal
        opened={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        memberId={member.id}
      />
      <FreezeMembershipModal
        opened={freezeOpen}
        onClose={() => setFreezeOpen(false)}
        member={member}
      />
      <EditMemberModal
        opened={editOpen}
        onClose={() => setEditOpen(false)}
        member={member}
      />
      <DeleteMemberModal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        member={member}
      />
    </>
  );
}
