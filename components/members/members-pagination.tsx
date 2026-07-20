"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import styles from "./members.module.css";

type MembersPaginationProps = {
  showing: number;
  total: number;
  nextCursor: string | null;
  hasCursor: boolean;
};

export function MembersPagination({
  showing,
  total,
  nextCursor,
  hasCursor,
}: MembersPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const goNext = () => {
    if (!nextCursor) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("cursor", nextCursor);
    startTransition(() => {
      router.push(`/dashboard/members?${params.toString()}`);
    });
  };

  const goPrev = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("cursor");
    startTransition(() => {
      router.push(`/dashboard/members?${params.toString()}`);
    });
  };

  if (total === 0) return null;

  const from = hasCursor ? "…" : "1";
  const to = showing;

  return (
    <div className={styles.pagination}>
      <span>
        Showing {from}–{to} of {total} members
      </span>
      <div className={styles.pageBtns}>
        <button
          type="button"
          className={`${styles.pageBtn} ${!hasCursor ? styles.pageBtnDisabled : ""}`}
          onClick={goPrev}
          disabled={!hasCursor}
          aria-label="Previous page"
        >
          ‹
        </button>
        <span className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</span>
        <button
          type="button"
          className={`${styles.pageBtn} ${!nextCursor ? styles.pageBtnDisabled : ""}`}
          onClick={goNext}
          disabled={!nextCursor}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}
