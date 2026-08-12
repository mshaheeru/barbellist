"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import {
  ensureCardToken,
  getCardMember,
  getPackagesForCards,
  listUnissuedMembers,
  markCardPrinted,
  regenerateQRToken,
} from "@/app/actions/cards";
import { qrTokenToDataUrl } from "@/lib/cards/qr";
import type { CardMember } from "@/lib/cards/types";
import { useGym } from "@/components/gym-provider";
import { CardPreviewPanel } from "./card-preview-panel";
import { CardDetailsPanel } from "./card-details-panel";
import {
  MembershipCardBack,
  MembershipCardFront,
} from "./membership-card";
import styles from "./cards.module.css";

type CardsPageClientProps = {
  initialMemberId?: string;
};

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

async function captureElement(el: HTMLElement): Promise<string> {
  return toPng(el, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: undefined,
  });
}

export function CardsPageClient({ initialMemberId }: CardsPageClientProps) {
  const { gym } = useGym();
  const router = useRouter();
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const captureFrontRef = useRef<HTMLDivElement>(null);
  const captureBackRef = useRef<HTMLDivElement>(null);

  const [member, setMember] = useState<CardMember | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [packages, setPackages] = useState<
    { id: string; name: string; color: string }[]
  >([]);
  const [busy, setBusy] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [captureMember, setCaptureMember] = useState<CardMember | null>(null);
  const [captureQr, setCaptureQr] = useState<string | null>(null);

  const loadQr = useCallback(async (token: string | null) => {
    if (!token) {
      setQrDataUrl(null);
      return;
    }
    try {
      const url = await qrTokenToDataUrl(token);
      setQrDataUrl(url);
    } catch {
      setQrDataUrl(null);
      notifications.show({
        color: "red",
        message: "Failed to render QR code",
      });
    }
  }, []);

  const loadMember = useCallback(
    async (id: string) => {
      setBusy(true);
      try {
        let { data, error } = await getCardMember(id);
        if (error) {
          notifications.show({ color: "red", message: error });
          return;
        }
        if (!data) {
          notifications.show({ color: "red", message: "Member not found" });
          return;
        }

        if (!data.card_qr_token) {
          const ensured = await ensureCardToken(id);
          if (ensured.error || !ensured.data) {
            notifications.show({
              color: "red",
              message: ensured.error ?? "Failed to issue QR token",
            });
            return;
          }
          data = ensured.data;
        }

        setMember(data);
        await loadQr(data.card_qr_token);
        router.replace(`/dashboard/cards?member=${id}`, { scroll: false });
      } finally {
        setBusy(false);
      }
    },
    [loadQr, router],
  );

  useEffect(() => {
    void getPackagesForCards().then((res) => {
      if (res.data) setPackages(res.data);
    });
  }, []);

  useEffect(() => {
    if (initialMemberId) {
      void loadMember(initialMemberId);
    }
    // Only on mount / initial id change from server
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMemberId]);

  const waitForCapture = useCallback(async (m: CardMember, qr: string) => {
    setCaptureMember(m);
    setCaptureQr(qr);
    // Allow React to paint offscreen capture nodes
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 50));
  }, []);

  const clearCapture = useCallback(() => {
    setCaptureMember(null);
    setCaptureQr(null);
  }, []);

  const handlePrint = useCallback(async () => {
    if (!member?.card_qr_token) return;
    setBusy(true);
    try {
      const qr = qrDataUrl ?? (await qrTokenToDataUrl(member.card_qr_token));
      await waitForCapture(member, qr);

      const frontEl = captureFrontRef.current;
      const backEl = captureBackRef.current;
      if (!frontEl || !backEl) {
        throw new Error("Card preview not ready");
      }

      const [frontPng, backPng] = await Promise.all([
        captureElement(frontEl),
        captureElement(backEl),
      ]);

      downloadDataUrl(frontPng, `${member.member_code}-front.png`);
      downloadDataUrl(backPng, `${member.member_code}-back.png`);

      const { data, error } = await markCardPrinted(member.id);
      if (error) {
        notifications.show({ color: "red", message: error });
      } else if (data) {
        setMember(data);
        notifications.show({
          color: "green",
          message: "Card downloaded and marked as printed",
        });
      }
    } catch (e) {
      notifications.show({
        color: "red",
        message: e instanceof Error ? e.message : "Print failed",
      });
    } finally {
      clearCapture();
      setBusy(false);
    }
  }, [member, qrDataUrl, waitForCapture, clearCapture]);

  const handleWhatsApp = useCallback(() => {
    notifications.show({
      color: "blue",
      title: "Coming soon",
      message:
        "Sending digital cards on WhatsApp isn’t available yet. You can still print or download the card.",
    });
  }, []);

  const handleRegenerate = useCallback(async () => {
    if (!member) return;
    setBusy(true);
    try {
      const { data, error } = await regenerateQRToken(member.id);
      if (error || !data) {
        notifications.show({
          color: "red",
          message: error ?? "Failed to regenerate QR",
        });
        return;
      }
      setMember(data);
      await loadQr(data.card_qr_token);
      notifications.show({
        color: "green",
        message: "QR code regenerated — old codes will no longer work",
      });
    } finally {
      setBusy(false);
    }
  }, [member, loadQr]);

  const handleBulkGenerate = useCallback(async () => {
    setBusy(true);
    setBulkProgress({ current: 0, total: 0 });
    try {
      const { data: unissued, error } = await listUnissuedMembers();
      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }
      if (!unissued || unissued.length === 0) {
        notifications.show({
          color: "blue",
          message: "All members already have cards issued",
        });
        return;
      }

      const zip = new JSZip();
      setBulkProgress({ current: 0, total: unissued.length });

      for (let i = 0; i < unissued.length; i++) {
        const row = unissued[i];
        const ensured = await ensureCardToken(row.id);
        if (ensured.error || !ensured.data?.card_qr_token) {
          notifications.show({
            color: "red",
            message: `Skipped ${row.name}: ${ensured.error ?? "no token"}`,
          });
          setBulkProgress({ current: i + 1, total: unissued.length });
          continue;
        }

        const card = ensured.data;
        const qr = await qrTokenToDataUrl(card.card_qr_token!);
        await waitForCapture(card, qr);

        const frontEl = captureFrontRef.current;
        const backEl = captureBackRef.current;
        if (frontEl && backEl) {
          const [frontPng, backPng] = await Promise.all([
            captureElement(frontEl),
            captureElement(backEl),
          ]);
          const folder = zip.folder(card.member_code) ?? zip;
          folder.file(
            "front.png",
            frontPng.split(",")[1] ?? "",
            { base64: true },
          );
          folder.file(
            "back.png",
            backPng.split(",")[1] ?? "",
            { base64: true },
          );
        }

        await markCardPrinted(card.id);
        setBulkProgress({ current: i + 1, total: unissued.length });
      }

      clearCapture();

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "membership-cards.zip";
      link.click();
      URL.revokeObjectURL(url);

      notifications.show({
        color: "green",
        message: `Generated ${unissued.length} card(s)`,
      });

      if (member) {
        void loadMember(member.id);
      }
    } catch (e) {
      notifications.show({
        color: "red",
        message: e instanceof Error ? e.message : "Bulk generation failed",
      });
    } finally {
      clearCapture();
      setBusy(false);
      setTimeout(() => setBulkProgress(null), 1500);
    }
  }, [member, waitForCapture, clearCapture, loadMember]);

  return (
    <div className={styles.layout}>
      <CardPreviewPanel
        member={member}
        gym={gym}
        qrDataUrl={qrDataUrl}
        frontRef={frontRef}
        backRef={backRef}
      />
      <CardDetailsPanel
        member={member}
        packages={packages}
        busy={busy}
        bulkProgress={bulkProgress}
        onSelectMember={(id) => void loadMember(id)}
        onPrint={() => void handlePrint()}
        onWhatsApp={handleWhatsApp}
        onRegenerate={() => void handleRegenerate()}
        onBulkGenerate={() => void handleBulkGenerate()}
      />

      {/* Offscreen capture targets — stable size for html-to-image */}
      <div className={styles.captureRoot} aria-hidden>
        {captureMember && (
          <>
            <MembershipCardFront
              member={captureMember}
              gym={gym}
              qrDataUrl={captureQr}
              cardRef={captureFrontRef}
            />
            <MembershipCardBack
              member={captureMember}
              gym={gym}
              cardRef={captureBackRef}
            />
          </>
        )}
      </div>
    </div>
  );
}
