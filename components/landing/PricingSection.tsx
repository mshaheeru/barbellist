"use client";

import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Reveal } from "./Reveal";

export const AUDIT_WHATSAPP_MSG =
  "Hi, I'd like a free Gym Revenue Leak Audit for my gym. I can share my member list or a summary.";

const EARLY_FEATURES = [
  "Up to 150 members included",
  "Personal migration & setup by founders",
  "Revenue leak dashboard",
  "Automated WhatsApp reminders",
  "At-risk & inactive member alerts",
  "QR membership cards + check-in kiosk",
];

const STANDARD_FEATURES = [
  "Higher member caps",
  "Multi-branch support",
  "Advanced analytics",
  "Priority support",
  "Everything in Founding Gym",
];

export function PricingSection() {
  return (
    <Reveal
      as="section"
      id="pricing"
      aria-label="Pricing"
      className="lp-section"
    >
      <span className="lp-section-label">Founding Gym offer</span>
      <h2
        className="lp-heading-lg"
        style={{
          textAlign: "center",
          fontSize: "clamp(36px, 5vw, 56px)",
          lineHeight: 1.05,
        }}
      >
        Priced to pay for itself.
      </h2>
      <p
        style={{
          textAlign: "center",
          fontSize: 18,
          color: "var(--lp-text-muted)",
          maxWidth: 520,
          margin: "16px auto 0",
          lineHeight: 1.6,
        }}
      >
        We migrate your members and configure Barbellist personally. First 30
        days free. Cancel anytime.
      </p>

      <div
        style={{
          maxWidth: 560,
          margin: "32px auto 0",
          background: "var(--lp-accent-glow)",
          border: "1px solid rgba(201,134,27,0.25)",
          borderRadius: 16,
          padding: "20px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--lp-accent)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Make More Than You Pay Guarantee
        </div>
        <p
          style={{
            fontSize: 15,
            color: "var(--lp-text-primary)",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          If Barbellist doesn&apos;t recover at least your monthly subscription
          fee during your first paid month, we refund that month&apos;s
          subscription.
        </p>
      </div>

      <div className="lp-pricing-grid">
        <div className="lp-price-card">
          <span
            style={{
              display: "inline-flex",
              background: "var(--lp-accent-glow)",
              border: "1px solid rgba(201,134,27,0.3)",
              borderRadius: 999,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--lp-accent)",
              marginBottom: 20,
            }}
          >
            ⚡ First 50 gyms only
          </span>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--lp-text-primary)",
              marginBottom: 12,
            }}
          >
            Founding Gym
          </div>
          <div className="lp-price-amount">Rs. 35,000</div>
          <div
            style={{
              fontSize: 14,
              color: "var(--lp-text-muted)",
              marginTop: 6,
              marginBottom: 4,
            }}
          >
            / month after trial
          </div>
          <div
            style={{
              fontSize: 16,
              color: "var(--lp-text-primary)",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Up to 150 members included
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--lp-accent)",
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            First 30 days free · No card required
          </div>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 32,
            }}
          >
            {EARLY_FEATURES.map((f) => (
              <li
                key={f}
                style={{
                  display: "flex",
                  gap: 10,
                  fontSize: 14,
                  color: "var(--lp-text-primary)",
                }}
              >
                <span style={{ color: "var(--lp-accent)", fontWeight: 700 }}>
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
          <a
            href={getWhatsAppUrl(AUDIT_WHATSAPP_MSG)}
            target="_blank"
            rel="noopener noreferrer"
            className="lp-btn-primary"
            style={{ width: "100%" }}
          >
            Get free Revenue Leak Audit →
          </a>
        </div>

        <div className="lp-price-card lp-price-card-dim">
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--lp-text-muted)",
              marginBottom: 12,
              marginTop: 36,
            }}
          >
            Standard
          </div>
          <div
            className="lp-price-amount"
            style={{ color: "var(--lp-text-muted)" }}
          >
            Custom
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--lp-text-muted)",
              marginTop: 6,
              marginBottom: 28,
            }}
          >
            Higher caps · multi-branch
            <br />
            After Founding period
          </div>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 32,
            }}
          >
            {STANDARD_FEATURES.map((f) => (
              <li
                key={f}
                style={{
                  display: "flex",
                  gap: 10,
                  fontSize: 14,
                  color: "var(--lp-text-muted)",
                }}
              >
                <span style={{ color: "var(--lp-text-muted)", fontWeight: 700 }}>
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled
            style={{
              width: "100%",
              padding: "16px 32px",
              borderRadius: 8,
              border: "1px solid var(--lp-white-5)",
              background: "var(--lp-white-5)",
              color: "var(--lp-text-muted)",
              fontWeight: 600,
              fontSize: 16,
              cursor: "not-allowed",
              fontFamily: "inherit",
            }}
          >
            Coming soon
          </button>
        </div>
      </div>
    </Reveal>
  );
}
