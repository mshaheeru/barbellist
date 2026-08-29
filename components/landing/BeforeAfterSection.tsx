"use client";

import { Reveal } from "./Reveal";

const WITHOUT = [
  {
    title: "Member owes 6 weeks fees.",
    consequence: "You find out when they walk in today.",
  },
  {
    title: "Sunday morning.",
    consequence: "You're chasing payments on WhatsApp. Manually.",
  },
  {
    title: "Cash collected at desk.",
    consequence: "Month end totals don't match. You don't know why.",
  },
  {
    title: "Member stopped coming 18 days ago.",
    consequence: "Your register says: Active.",
  },
  {
    title: "Lead WhatsApped about membership.",
    consequence: "Nobody followed up. They're now at a competitor.",
  },
];

const WITH = [
  {
    title: "Overdue flagged on Day 1.",
    consequence: "Payment link sent automatically. Member pays.",
  },
  {
    title: "Reminders go out at 9 AM.",
    consequence: "You're at the gym floor. Not your phone.",
  },
  {
    title: "Every collection recorded.",
    consequence: "Owner dashboard shows live cash position.",
  },
  {
    title: "At-risk alert triggered.",
    consequence: "Automated check-in message sent. Member returns.",
  },
  {
    title: "Lead captured automatically.",
    consequence: "Follow-up sequence starts. Trial booked.",
  },
];

export function BeforeAfterSection() {
  return (
    <Reveal as="section" aria-label="Before and after" className="lp-section">
      <div className="lp-before-after">
        <div className="lp-ba-col lp-ba-without">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(220,38,38,0.12)",
              border: "1px solid rgba(220,38,38,0.25)",
              borderRadius: 999,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: "#f87171",
              marginBottom: 28,
            }}
          >
            ❌ Without Barbellist
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {WITHOUT.map((row) => (
              <div
                key={row.title}
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <span
                  style={{
                    color: "#f87171",
                    fontWeight: 700,
                    fontSize: 16,
                    lineHeight: 1.4,
                    flexShrink: 0,
                  }}
                  aria-hidden
                >
                  ✗
                </span>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--lp-text-primary)",
                      fontSize: 15,
                      lineHeight: 1.35,
                    }}
                  >
                    {row.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--lp-text-muted)",
                      marginTop: 4,
                      lineHeight: 1.45,
                    }}
                  >
                    {row.consequence}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lp-ba-divider" aria-hidden />

        <div className="lp-ba-col lp-ba-with">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--lp-accent-glow)",
              border: "1px solid rgba(201,134,27,0.3)",
              borderRadius: 999,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--lp-accent)",
              marginBottom: 28,
            }}
          >
            ✦ With Barbellist
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {WITH.map((row) => (
              <div
                key={row.title}
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <span
                  style={{
                    color: "var(--lp-accent)",
                    fontWeight: 700,
                    fontSize: 16,
                    lineHeight: 1.4,
                    flexShrink: 0,
                  }}
                  aria-hidden
                >
                  ✓
                </span>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--lp-text-primary)",
                      fontSize: 15,
                      lineHeight: 1.35,
                    }}
                  >
                    {row.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--lp-text-muted)",
                      marginTop: 4,
                      lineHeight: 1.45,
                    }}
                  >
                    {row.consequence}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
