"use client";

import { useState } from "react";
import Link from "next/link";
import { buildFaqData } from "./landing-data";
import { CurrencyProvider, useCurrency } from "./CurrencyProvider";

export function FaqPageClient() {
  return (
    <CurrencyProvider>
      <FaqInner />
    </CurrencyProvider>
  );
}

function FaqInner() {
  const { profile } = useCurrency();
  const faqs = buildFaqData(profile);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <main
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "56px 24px 96px",
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#C9861B",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        Help
      </p>
      <h1
        style={{
          fontSize: 40,
          lineHeight: 1.12,
          letterSpacing: "-0.03em",
          fontWeight: 800,
          color: "#173D28",
          marginBottom: 12,
        }}
      >
        Questions, answered.
      </h1>
      <p style={{ fontSize: 17, color: "#6B6862", marginBottom: 44 }}>
        Everything gym owners ask before switching from paper and spreadsheets.
      </p>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {faqs.map((faq, i) => (
          <div key={faq.q} style={{ borderBottom: "1px solid #E8E5DF" }}>
            <button
              type="button"
              onClick={() => setOpenFaq((s) => (s === i ? -1 : i))}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
                padding: "22px 4px",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#1F1F1F",
                }}
              >
                {faq.q}
              </span>
              <span
                style={{
                  flex: "0 0 auto",
                  width: 26,
                  height: 26,
                  position: "relative",
                  color: "#1B5E3C",
                }}
                aria-hidden
              >
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 14,
                    height: 2,
                    background: "currentColor",
                    transform: "translate(-50%, -50%)",
                    borderRadius: 2,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 2,
                    height: 14,
                    background: "currentColor",
                    transform: `translate(-50%, -50%) scaleY(${openFaq === i ? 0 : 1})`,
                    borderRadius: 2,
                    transition: "transform .2s",
                  }}
                />
              </span>
            </button>
            <div
              style={{
                maxHeight: openFaq === i ? 320 : 0,
                overflow: "hidden",
                transition: "max-height .3s ease",
              }}
            >
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "#6B6862",
                  padding: "0 4px 24px",
                  maxWidth: "64ch",
                }}
              >
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          marginTop: 48,
          fontSize: 15,
          color: "#6B6862",
          textAlign: "center",
        }}
      >
        Still have a question?{" "}
        <Link href="/home" style={{ color: "#1B5E3C", fontWeight: 600 }}>
          Back to home
        </Link>
      </p>
    </main>
  );
}
