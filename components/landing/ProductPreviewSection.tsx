"use client";

import { Reveal } from "./Reveal";
import { AnimatedDashboard } from "./AnimatedDashboard";
import { QrDots } from "./landing-helpers";

/** Product preview — dashboard + kiosk mock (after How it works). */
export function ProductPreviewSection() {
  return (
    <Reveal
      as="section"
      aria-label="Product preview"
      className="lp-section"
      style={{ paddingTop: 48 }}
    >
      <span className="lp-section-label">Inside Barbellist</span>
      <h2
        className="lp-heading-lg"
        style={{
          textAlign: "center",
          fontSize: "clamp(32px, 4vw, 48px)",
          lineHeight: 1.1,
          marginBottom: 16,
        }}
      >
        More revenue. Fewer cancellations. Less admin.
      </h2>
      <p
        style={{
          textAlign: "center",
          fontSize: 17,
          color: "var(--lp-text-muted)",
          maxWidth: 520,
          margin: "0 auto 48px",
          lineHeight: 1.6,
        }}
      >
        Barbellist finds the money your gym is losing and automates the work
        needed to recover it: collections, retention, and the daily ops that
        used to live in WhatsApp and a register.
      </p>

      <div
        className="lp-product-preview"
        style={{
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <div className="lp-hero-visual">
          <AnimatedDashboard />
        </div>
        <div className="lp-hero-kiosk" style={{ maxWidth: 320, margin: "24px auto 0" }}>
          <div
            style={{
              background: "#173D28",
              padding: "14px 18px",
              color: "#EBF3ED",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            Check-in kiosk
            <span style={{ opacity: 0.6, fontWeight: 500 }}>08:41</span>
          </div>
          <div style={{ padding: "22px 20px", textAlign: "center" }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--lp-text-primary)",
              }}
            >
              Welcome back, Hamza
            </div>
            <div
              style={{
                display: "inline-flex",
                marginTop: 8,
                background: "var(--lp-accent-glow)",
                color: "var(--lp-accent)",
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 12px",
                borderRadius: 100,
              }}
            >
              Fees paid · valid to 30 Aug
            </div>
            <div
              style={{
                marginTop: 16,
                height: 80,
                borderRadius: 12,
                background: "var(--lp-white-5)",
                border: "1px solid var(--lp-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QrDots color="#C9861B" />
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
