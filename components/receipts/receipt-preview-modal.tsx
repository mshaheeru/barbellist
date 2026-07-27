"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { toPng } from "html-to-image";
import { Download, MessageCircle, X } from "lucide-react";
import { markReceiptGenerated } from "@/app/actions/fees";
import { preparePaymentReceiptDeeplink } from "@/app/actions/whatsapp";
import { useGym } from "@/components/gym-provider";
import { canSendReminder } from "@/lib/auth/permissions";
import { formatReceiptNumber } from "@/lib/members/format";
import { openWaMeUrl } from "@/lib/whatsapp/deeplink";
import {
  ReceiptCard,
  type ReceiptPayment,
} from "./receipt-card";
import styles from "./receipt-preview-modal.module.css";

export type ReceiptPreviewModalProps = {
  opened: boolean;
  onClose: () => void;
  payment: ReceiptPayment;
  memberName: string;
  memberCode: string;
  memberWhatsapp: string | null;
  memberPhone: string | null;
  packageName: string | null;
  currencySymbol: string;
  /** Called after a successful PNG download (optional parent refresh). */
  onDownloaded?: () => void;
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
    backgroundColor: "#FAF7F2",
  });
}

export function ReceiptPreviewModal({
  opened,
  onClose,
  payment,
  memberName,
  memberCode,
  memberWhatsapp,
  memberPhone,
  packageName,
  currencySymbol,
  onDownloaded,
}: ReceiptPreviewModalProps) {
  const router = useRouter();
  const { gym, role } = useGym();
  const captureRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();

  const canWhatsApp = canSendReminder(role);
  const hasContact = Boolean(memberWhatsapp || memberPhone);
  const showSend = canWhatsApp && hasContact;

  useEffect(() => {
    if (!opened) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened, onClose]);

  if (!opened) return null;

  const gymBrand = gym
    ? {
        name: gym.name,
        logo_url: gym.logo_url,
        phone: gym.phone,
        whatsapp: gym.whatsapp,
        email: gym.email,
      }
    : null;

  const handleDownload = async () => {
    const el = captureRef.current;
    if (!el) return;
    setBusy(true);
    try {
      // Allow fonts/images a tick to settle before capture
      await new Promise((r) => setTimeout(r, 80));
      const dataUrl = await captureElement(el);
      const rcp = formatReceiptNumber(payment.id);
      downloadDataUrl(dataUrl, `receipt-${memberCode}-${rcp}.png`);

      const { error } = await markReceiptGenerated(payment.id);
      if (error) {
        notifications.show({
          color: "yellow",
          message: "Receipt downloaded, but could not update status",
        });
      } else {
        notifications.show({
          color: "green",
          message: "Receipt downloaded",
        });
      }
      onDownloaded?.();
      router.refresh();
    } catch {
      notifications.show({
        color: "red",
        title: "Download failed",
        message: "Could not generate receipt image. Try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleSendConfirmation = () => {
    startTransition(async () => {
      const { data, error } = await preparePaymentReceiptDeeplink(payment.id);
      if (error || !data) {
        notifications.show({
          color: "red",
          title: "Confirmation failed",
          message: error ?? "Could not prepare WhatsApp message",
        });
        return;
      }
      openWaMeUrl(data.url);
      notifications.show({
        color: "green",
        message: `WhatsApp opened with confirmation for ${data.memberName}`,
      });
      router.refresh();
    });
  };

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-preview-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 id="receipt-preview-title" className={styles.modalTitle}>
            Payment Receipt
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.previewStage}>
            <div className={styles.previewScale}>
              <ReceiptCard
                gym={gymBrand}
                memberName={memberName}
                memberCode={memberCode}
                currencySymbol={currencySymbol}
                payment={payment}
                packageName={packageName}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={busy || pending}
              onClick={() => void handleDownload()}
            >
              <Download size={17} strokeWidth={2.2} />
              Download Receipt
            </button>
            {showSend ? (
              <button
                type="button"
                className={styles.secondaryBtn}
                disabled={busy || pending}
                onClick={handleSendConfirmation}
              >
                <MessageCircle size={17} strokeWidth={2.2} />
                Send Confirmation via WhatsApp
              </button>
            ) : null}
            <p className={styles.hint}>
              Download the image, then attach it in WhatsApp if you want to
              share the visual receipt.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.captureHost} aria-hidden>
        <ReceiptCard
          cardRef={captureRef}
          gym={gymBrand}
          memberName={memberName}
          memberCode={memberCode}
          currencySymbol={currencySymbol}
          payment={payment}
          packageName={packageName}
        />
      </div>
    </div>
  );
}
