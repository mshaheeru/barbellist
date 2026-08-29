"use client";

import { Reveal } from "./Reveal";

const BREAKDOWN = [
  { label: "Overdue fees collected", amount: "Rs. 18,500" },
  { label: "Expiring memberships saved", amount: "Rs. 14,200" },
  { label: "At-risk members retained", amount: "Rs. 9,800" },
  { label: "Former members reactivated", amount: "Rs. 4,700" },
];

export function RecoveredRevenueCard() {
  return (
    <Reveal as="section" id="results" aria-label="What Barbellist owners see">
      <div className="lp-number-section" style={{ background: "#0D0D0D" }}>
        <div style={{ maxWidth: 896, margin: "0 auto", textAlign: "center" }}>
          <span className="lp-section-label">What Barbellist owners see</span>

          <div
            style={{
              background: "var(--lp-bg-card)",
              border: "1px solid var(--lp-border)",
              borderRadius: 24,
              padding: "48px 40px",
              margin: "40px auto 0",
              maxWidth: 560,
              boxShadow: "0 0 60px rgba(201,134,27,0.06)",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--lp-accent-glow)",
                  border: "1px solid rgba(201,134,27,0.25)",
                  borderRadius: 999,
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--lp-accent)",
                }}
              >
                💰 This month
              </span>
              <span style={{ fontSize: 13, color: "var(--lp-text-muted)" }}>
                Iron Republic · August 2026
              </span>
            </div>

            <div style={{ marginTop: 24, textAlign: "center" }}>
              <div
                className="num"
                style={{
                  fontSize: "clamp(48px, 8vw, 72px)",
                  fontWeight: 900,
                  color: "var(--lp-accent)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                Rs. 47,200
              </div>
              <p
                style={{
                  marginTop: 10,
                  fontSize: 16,
                  color: "var(--lp-text-muted)",
                }}
              >
                recovered by Barbellist this month
              </p>
            </div>

            <div
              style={{
                borderTop: "1px solid var(--lp-border)",
                margin: "28px 0",
              }}
            />

            <div className="lp-recovered-grid">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {BREAKDOWN.map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: "var(--lp-text-muted)" }}>
                      {row.label}
                    </span>
                    <span
                      className="num"
                      style={{
                        color: "var(--lp-text-primary)",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.amount}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "8px 0",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--lp-text-muted)",
                    marginBottom: 6,
                  }}
                >
                  Barbellist cost this month
                </span>
                <span
                  className="num"
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "var(--lp-text-primary)",
                  }}
                >
                  Rs. 35,000
                </span>
              </div>
            </div>

            <div
              style={{
                background: "var(--lp-accent-glow)",
                border: "1px solid rgba(201,134,27,0.2)",
                borderRadius: 12,
                padding: 16,
                textAlign: "center",
                marginTop: 24,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--lp-text-primary)",
                  fontSize: 18,
                }}
              >
                ROI this month: 1.3×
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--lp-text-muted)",
                  marginTop: 6,
                  lineHeight: 1.5,
                }}
              >
                Subscription covered, with Rs. 12,200 recovered above cost.
              </p>
            </div>
          </div>

          <p
            style={{
              marginTop: 28,
              fontSize: 15,
              color: "var(--lp-text-muted)",
              maxWidth: 480,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
            }}
          >
            Results vary by gym size, pricing, overdue balances and member
            activity.
          </p>
        </div>
      </div>
    </Reveal>
  );
}
