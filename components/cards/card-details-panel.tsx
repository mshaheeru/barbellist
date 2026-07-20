"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, MessageCircle, Printer, RefreshCw, Layers } from "lucide-react";
import { Progress, TextInput } from "@mantine/core";
import { getInitials } from "@/lib/members/format";
import {
  formatCardExpiry,
  formatCardIssued,
} from "@/lib/cards/format";
import type {
  CardMember,
  CardMemberSearchResult,
} from "@/lib/cards/types";
import { searchMembersForCardSelector } from "@/app/actions/cards";
import styles from "./cards.module.css";

type PackageOption = { id: string; name: string; color: string };

type CardDetailsPanelProps = {
  member: CardMember | null;
  packages: PackageOption[];
  busy: boolean;
  bulkProgress: { current: number; total: number } | null;
  onSelectMember: (id: string) => void;
  onPrint: () => void;
  onWhatsApp: () => void;
  onRegenerate: () => void;
  onBulkGenerate: () => void;
};

export function CardDetailsPanel({
  member,
  packages,
  busy,
  bulkProgress,
  onSelectMember,
  onPrint,
  onWhatsApp,
  onRegenerate,
  onBulkGenerate,
}: CardDetailsPanelProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CardMemberSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setSearching(true);
      void searchMembersForCardSelector({ query }).then((res) => {
        setResults(res.data ?? []);
        setSearching(false);
      });
    }, 220);

    return () => clearTimeout(timer);
  }, [query, open]);

  const selectedPkgId = member?.package_id ?? member?.package?.id ?? null;

  return (
    <div className={styles.detailsPane}>
      <h2 className={styles.detailsTitle}>Card Details</h2>

      <div className={styles.fields}>
        <div>
          <div className={styles.fieldLabel}>Member</div>
          <div className={styles.memberPicker} ref={rootRef}>
            <button
              type="button"
              className={`${styles.memberTrigger} ${open ? styles.memberTriggerOpen : ""}`}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              <div className={styles.memberTriggerLeft}>
                {member ? (
                  <>
                    <div className={styles.pickerAvatar}>
                      {member.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.photo_url}
                          alt=""
                          className={styles.pickerAvatarImg}
                        />
                      ) : (
                        getInitials(member.name)
                      )}
                    </div>
                    <span className={styles.pickerLabel}>
                      {member.name} · {member.member_code}
                    </span>
                  </>
                ) : (
                  <span className={styles.pickerPlaceholder}>
                    Search members…
                  </span>
                )}
              </div>
              <ChevronDown size={16} color="#8A8A80" strokeWidth={2} />
            </button>

            {open && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownSearch}>
                  <TextInput
                    placeholder="Name or member code"
                    value={query}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                    autoFocus
                    size="sm"
                  />
                </div>
                <div className={styles.dropdownList}>
                  {searching && (
                    <div className={styles.dropdownEmpty}>Searching…</div>
                  )}
                  {!searching && query.trim() && results.length === 0 && (
                    <div className={styles.dropdownEmpty}>No members found</div>
                  )}
                  {!searching &&
                    results.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => {
                          onSelectMember(r.id);
                          setOpen(false);
                          setQuery("");
                          setResults([]);
                        }}
                      >
                        <div className={styles.pickerAvatar}>
                          {r.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={r.photo_url}
                              alt=""
                              className={styles.pickerAvatarImg}
                            />
                          ) : (
                            getInitials(r.name)
                          )}
                        </div>
                        <span className={styles.pickerLabel}>
                          {r.name} · {r.member_code}
                        </span>
                      </button>
                    ))}
                  {!searching && !query.trim() && (
                    <div className={styles.dropdownEmpty}>
                      Type to search members
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className={styles.fieldLabel}>
            Package Tier{" "}
            <span className={styles.fieldHint}>· sets card colour</span>
          </div>
          <div className={styles.tierRow}>
            {packages.length === 0 ? (
              <div className={styles.fieldBox}>—</div>
            ) : (
              packages.map((pkg) => {
                const active = selectedPkgId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    className={`${styles.tierPill} ${active ? styles.tierPillActive : ""}`}
                    style={
                      active
                        ? {
                            borderColor: pkg.color || "#C9861B",
                            color: pkg.color || "#B07A15",
                          }
                        : undefined
                    }
                  >
                    {pkg.name}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div>
          <div className={styles.fieldLabel}>Card Number</div>
          <div className={styles.fieldBox}>
            {member?.member_code ?? "—"}
          </div>
        </div>

        <div className={styles.dateRow}>
          <div className={styles.dateCol}>
            <div className={styles.fieldLabel}>Issued</div>
            <div className={styles.fieldBox}>
              {formatCardIssued(member?.card_issued_at)}
            </div>
          </div>
          <div className={styles.dateCol}>
            <div className={styles.fieldLabel}>Expiry</div>
            <div className={styles.fieldBox}>
              {formatCardExpiry(member?.membership_end)}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btnPrimary}
          disabled={!member || busy}
          onClick={onPrint}
        >
          <Printer size={18} strokeWidth={2} />
          Print Card
        </button>
        <button
          type="button"
          className={styles.btnSecondary}
          disabled={!member || busy}
          onClick={onWhatsApp}
        >
          <MessageCircle size={18} color="#1B5E3C" strokeWidth={2} />
          Send Digital Card via WhatsApp
        </button>
        <button
          type="button"
          className={styles.btnTertiary}
          disabled={!member || busy}
          onClick={onRegenerate}
        >
          <RefreshCw size={15} strokeWidth={2} />
          Regenerate QR Code
        </button>

        <div className={styles.bulkSection}>
          <button
            type="button"
            className={styles.btnTertiary}
            disabled={busy}
            onClick={onBulkGenerate}
          >
            <Layers size={15} strokeWidth={2} />
            Generate All Cards
          </button>
          {bulkProgress && bulkProgress.total > 0 && (
            <div className={styles.bulkProgress}>
              <Progress
                value={
                  (bulkProgress.current / bulkProgress.total) * 100
                }
                color="#1B5E3C"
                size="sm"
                radius="md"
              />
              <div className={styles.bulkStatus}>
                {bulkProgress.current} / {bulkProgress.total} cards
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
