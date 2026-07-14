"use client";

import { useEffect } from "react";
import { openWhatsApp } from "@/lib/whatsapp";

type OrderChoiceModalProps = {
  open: boolean;
  onClose: () => void;
  onChooseForm: () => void;
};

export function OrderChoiceModal({
  open,
  onClose,
  onChooseForm,
}: OrderChoiceModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="How would you like to order"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(23, 61, 40, 0.55)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        padding: 24,
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          margin: "auto",
          background: "#FAF7F2",
          borderRadius: 20,
          border: "1px solid #E7E2D6",
          boxShadow:
            "0 32px 80px -24px rgba(23,61,40,.45), 0 0 0 1px rgba(255,255,255,.6) inset",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #173D28 0%, #1B5E3C 100%)",
            padding: "28px 28px 24px",
            color: "#EBF3ED",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,.12)",
              color: "#fff",
              fontSize: 20,
              lineHeight: 1,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#E7B24E",
              marginBottom: 10,
            }}
          >
            Order Barbellist
          </div>
          <h2
            style={{
              fontSize: 26,
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#fff",
              maxWidth: "16ch",
            }}
          >
            How would you like to continue?
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "#B9CFC1",
              marginTop: 10,
              lineHeight: 1.5,
            }}
          >
            Chat with us instantly on WhatsApp, or leave your details in a short
            form.
          </p>
        </div>

        <div
          style={{
            padding: "24px 28px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => {
              onClose();
              openWhatsApp();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              width: "100%",
              textAlign: "left",
              padding: "18px 18px",
              borderRadius: 14,
              border: "1px solid #C6EBD4",
              background: "linear-gradient(180deg, #F2FBF5, #E8F7EE)",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 8px 22px -14px rgba(37,211,102,.55)",
              transition: "transform .15s, box-shadow .15s",
            }}
          >
            <span
              style={{
                flex: "0 0 auto",
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#25D366",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 16px rgba(37,211,102,.35)",
              }}
            >
              <WhatsAppGlyph />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  display: "block",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#173D28",
                }}
              >
                WhatsApp
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 13,
                  color: "#5E7166",
                  marginTop: 3,
                  lineHeight: 1.4,
                }}
              >
                Message us now — usually the fastest way
              </span>
            </span>
            <span style={{ color: "#1B5E3C", fontSize: 18, fontWeight: 700 }}>
              →
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onChooseForm();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              width: "100%",
              textAlign: "left",
              padding: "18px 18px",
              borderRadius: 14,
              border: "1px solid #E7E2D6",
              background: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 8px 22px -16px rgba(23,61,40,.35)",
              transition: "transform .15s, box-shadow .15s",
            }}
          >
            <span
              style={{
                flex: "0 0 auto",
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#173D28",
                color: "#E7B24E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              ✎
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  display: "block",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#173D28",
                }}
              >
                Fill out the form
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 13,
                  color: "#6B6862",
                  marginTop: 3,
                  lineHeight: 1.4,
                }}
              >
                Leave your contact details and we&apos;ll reach out
              </span>
            </span>
            <span style={{ color: "#C9861B", fontSize: 18, fontWeight: 700 }}>
              →
            </span>
          </button>

          <p
            style={{
              fontSize: 12,
              color: "#9A968B",
              textAlign: "center",
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            Ridiculously low for the first 3 months · Affordable after · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}

function WhatsAppGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
