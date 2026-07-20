"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { TextInput } from "@mantine/core";
import { Search } from "lucide-react";
import {
  checkInMember,
  searchMembersForKiosk,
} from "@/app/actions/attendance";
import { getInitials } from "@/components/gym-provider";
import type { CheckInResult } from "@/lib/types";
import { mapKioskError, type KioskErrorInfo } from "./kiosk-error-screen";
import styles from "./kiosk.module.css";

type KioskManualEntryProps = {
  onResult: (result: CheckInResult) => void;
  onError: (error: KioskErrorInfo) => void;
};

type SearchResult = {
  id: string;
  name: string;
  photo_url: string | null;
  member_code: string;
  package_name: string | null;
};

export function KioskManualEntry({ onResult, onError }: KioskManualEntryProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [, startTransition] = useTransition();
  const [checkingId, setCheckingId] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const { data } = await searchMembersForKiosk({ query });
        setResults(data ?? []);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback(
    async (memberId: string) => {
      setCheckingId(memberId);
      const { data, error } = await checkInMember({
        member_id: memberId,
        method: "manual",
      });
      setCheckingId(null);

      if (error || !data) {
        onError(mapKioskError(error));
        return;
      }

      onResult(data);
    },
    [onResult, onError],
  );

  return (
    <div className={styles.manualPanel}>
      <div className={styles.instruction} style={{ marginTop: 0, marginBottom: 16 }}>
        <div className={styles.instructionTitle}>Manual check-in</div>
        <div className={styles.instructionSub}>
          Search and tap a member to check them in
        </div>
      </div>
      <TextInput
        className={styles.manualSearch}
        placeholder="Search by name or member code…"
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        leftSection={<Search size={18} color="#9fc3ae" />}
        size="lg"
        styles={{
          input: {
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            borderRadius: 14,
          },
        }}
      />
      <div className={styles.manualResults}>
        {results.map((member) => (
          <button
            key={member.id}
            type="button"
            className={styles.manualResultBtn}
            disabled={checkingId === member.id}
            onClick={() => void handleSelect(member.id)}
          >
            <div className={styles.manualAvatar}>
              {member.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.photo_url} alt="" />
              ) : (
                getInitials(member.name)
              )}
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>{member.name}</div>
              <div style={{ fontSize: 13, color: "#9fc3ae" }}>
                {member.package_name ?? "Member"} · {member.member_code}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
