"use client";

import { useEffect, useState } from "react";

const PHONE_DISPLAY = "+923367808477";
const PHONE_WHATSAPP = "923367808477";

type SalesContactModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SalesContactModal({ open, onClose }: SalesContactModalProps) {
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PHONE_DISPLAY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const whatsappUrl = `https://wa.me/${PHONE_WHATSAPP}?text=${encodeURIComponent(
    "Hi, I'm interested in Barbellist for my gym.",
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Contact sales"
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
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
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
            background: "linear-gradient(135deg, #C9861B 0%, #E7B24E 100%)",
            padding: "28px 32px 24px",
            color: "#3A2A08",
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
              background: "rgba(255,255,255,.25)",
              color: "#3A2A08",
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
              color: "rgba(58,42,8,.75)",
              marginBottom: 10,
            }}
          >
            Sales team
          </div>
          <h2
            style={{
              fontSize: 28,
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#173D28",
              maxWidth: "16ch",
            }}
          >
            Let&apos;s talk about your gym
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "rgba(23,61,40,.85)",
              marginTop: 10,
              lineHeight: 1.5,
            }}
          >
            Reach us directly — we&apos;re happy to answer questions and help
            you get started.
          </p>
        </div>

        <div style={{ padding: "28px 32px 32px" }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #EEE9DE",
              borderRadius: 14,
              padding: "20px 22px",
              boxShadow: "0 12px 30px -22px rgba(23,61,40,.2)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#9A968B",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Phone / WhatsApp
            </div>
            <div
              className="num"
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#173D28",
                letterSpacing: "-0.02em",
              }}
            >
              {PHONE_DISPLAY}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 20,
            }}
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "#25D366",
                color: "#fff",
                padding: "14px 16px",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 6px 18px rgba(37,211,102,.35)",
                transition: "transform .18s, box-shadow .18s",
              }}
            >
              <WhatsAppIcon />
              Open in WhatsApp
            </a>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: copied ? "#E7F3EC" : "#fff",
                color: copied ? "#1B5E3C" : "#173D28",
                padding: "14px 16px",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                border: `1px solid ${copied ? "#1B5E3C" : "#C9861B"}`,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background .18s, color .18s, border-color .18s",
              }}
            >
              {copied ? (
                <>
                  <CheckSmall />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon />
                  Copy number
                </>
              )}
            </button>
          </div>

          <p
            style={{
              fontSize: 13,
              color: "#8A877E",
              textAlign: "center",
              marginTop: 18,
              lineHeight: 1.5,
            }}
          >
            Available for gyms across South Asia, the Middle East, and beyond.
          </p>
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckSmall() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
