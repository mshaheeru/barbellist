"use client";

import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Reveal } from "./Reveal";
import { useCurrency } from "./CurrencyProvider";

const FOUNDER_WHATSAPP_MSG =
  "Hi, we have 200+ members (or multiple branches) and want a custom Barbellist plan for our gym.";

const EARLY_FEATURES = [
  "Personal migration & setup by founders",
  "Revenue leak dashboard",
  "Automated WhatsApp reminders",
  "At-risk member alerts",
  "QR cards & check-in kiosk",
];

const LARGER_FEATURES = [
  "Built around your gym size",
  "Multi-branch support",
  "Everything in Founding Gym",
  "Priority founder support",
];

export function PricingSection({
  onOpenAudit,
}: {
  onOpenAudit: () => void;
}) {
  const { earlyRate, earlyMin, memberCap, loading } = useCurrency();

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
        We migrate your members and configure Barbellist personally. You only
        pay for active members.
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
          If Barbellist doesn&apos;t recover at least your subscription during
          your first paid month, we refund that month.
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
          <div
            className="lp-price-amount"
            style={{ opacity: loading ? 0.4 : 1 }}
          >
            {earlyRate}
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--lp-text-muted)",
              marginTop: 6,
              marginBottom: 8,
            }}
          >
            / active member / month
          </div>
          <div
            style={{
              fontSize: 15,
              color: "var(--lp-text-primary)",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            You only pay for members you&apos;re managing.
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--lp-accent)",
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            First 30 days free · Cancel anytime
          </div>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 24,
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
          <p
            style={{
              fontSize: 12,
              color: "var(--lp-text-muted)",
              lineHeight: 1.5,
              marginBottom: 24,
            }}
          >
            Minimum {earlyMin}/month. Custom pricing for {memberCap}+ members.
          </p>
          <button
            type="button"
            onClick={onOpenAudit}
            className="lp-btn-primary"
            style={{ width: "100%" }}
          >
            Start free →
          </button>
        </div>

        <div className="lp-price-card">
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--lp-text-primary)",
              marginBottom: 12,
              marginTop: 36,
            }}
          >
            Larger gyms
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "var(--lp-text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              marginBottom: 12,
            }}
          >
            {memberCap}+ members or multiple branches?
          </div>
          <p
            style={{
              fontSize: 15,
              color: "var(--lp-text-muted)",
              lineHeight: 1.55,
              marginBottom: 28,
            }}
          >
            We&apos;ll build a plan around your gym.
          </p>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 32,
            }}
          >
            {LARGER_FEATURES.map((f) => (
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
            href={getWhatsAppUrl(FOUNDER_WHATSAPP_MSG)}
            target="_blank"
            rel="noopener noreferrer"
            className="lp-btn-secondary"
            style={{ width: "100%" }}
          >
            Talk to a founder →
          </a>
        </div>
      </div>
    </Reveal>
  );
}
