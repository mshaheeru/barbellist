"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAttendanceFeedItem,
  getAttendanceFeedPage,
  getLiveGymCounts,
} from "@/app/actions/attendance";
import { useGym } from "@/components/gym-provider";
import type {
  AttendanceFeedItem,
  AttendanceFeedPayload,
  AttendancePersonFilter,
  LiveGymCounts,
} from "@/lib/types";
import type { AttendanceDateRange } from "@/lib/validations/attendance";
import { AttendanceFeedPanel } from "./attendance-feed-list";
import { AttendancePageHeader } from "./attendance-page-header";
import { AttendanceSidebar } from "./attendance-sidebar";
import { LiveNowBanner } from "./live-now-banner";
import styles from "./attendance.module.css";

type AttendanceLiveFeedProps = {
  initial: AttendanceFeedPayload;
  dateRange: AttendanceDateRange;
};

function parsePersonFilter(raw: string | null): AttendancePersonFilter {
  if (raw === "member" || raw === "staff" || raw === "all") return raw;
  return "all";
}

export function AttendanceLiveFeed({
  initial,
  dateRange,
}: AttendanceLiveFeedProps) {
  const { supabase, gymId } = useGym();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const personFilter = parsePersonFilter(searchParams.get("filter"));

  const [feed, setFeed] = useState<AttendanceFeedItem[]>(initial.feed);
  const [liveCounts, setLiveCounts] = useState<LiveGymCounts>(initial.liveCounts);
  const [sidebar, setSidebar] = useState(initial.sidebar);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFeed(initial.feed);
    setLiveCounts(initial.liveCounts);
    setSidebar(initial.sidebar);
    setNewItemIds(new Set());
  }, [initial]);

  const filteredFeed = useMemo(() => {
    if (personFilter === "all") return feed;
    return feed.filter((item) => item.person_type === personFilter);
  }, [feed, personFilter]);

  const setPersonFilter = useCallback(
    (filter: AttendancePersonFilter) => {
      const params = new URLSearchParams(searchParams.toString());
      if (filter === "all") {
        params.delete("filter");
      } else {
        params.set("filter", filter);
      }
      startTransition(() => {
        router.push(`/dashboard/attendance?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition],
  );

  useEffect(() => {
    if (!gymId) return;

    const channel = supabase
      .channel(`attendance-feed-${gymId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attendance",
          filter: `gym_id=eq.${gymId}`,
        },
        (payload) => {
          const id = payload.new.id as string;
          void (async () => {
            const { data: item } = await getAttendanceFeedItem(id);
            if (!item) return;

            setFeed((prev) => {
              if (prev.some((r) => r.id === item.id)) return prev;
              return [item, ...prev];
            });
            setNewItemIds((prev) => new Set(prev).add(id));
            setTimeout(() => {
              setNewItemIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
              });
            }, 2000);

            const { data: counts } = await getLiveGymCounts();
            if (counts) setLiveCounts(counts);

            const { data: page } = await getAttendanceFeedPage({
              date_range: dateRange,
              person_filter: personFilter,
            });
            if (page) setSidebar(page.sidebar);
          })();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, gymId, dateRange, personFilter]);

  return (
    <>
      <AttendancePageHeader
        dateLabel={initial.dateLabel}
        currentRange={dateRange}
      />
      <LiveNowBanner counts={liveCounts} />
      <div className={styles.layoutGrid}>
        <AttendanceFeedPanel
          items={filteredFeed}
          personFilter={personFilter}
          onPersonFilterChange={setPersonFilter}
          newItemIds={newItemIds}
        />
        <AttendanceSidebar stats={sidebar} />
      </div>
    </>
  );
}
