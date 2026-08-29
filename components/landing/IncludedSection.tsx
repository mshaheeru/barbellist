"use client";

import { Reveal } from "./Reveal";

const INCLUDED = [
  {
    title: "Collections that run without you",
    body: "Overdue fees flagged daily. Payment links and WhatsApp reminders sent automatically, so Sunday mornings stay on the gym floor.",
  },
  {
    title: "Retention before churn",
    body: "At-risk and inactive members surface early. Personal check-in messages go out before they quietly disappear.",
  },
  {
    title: "Renewals you don't chase",
    body: "Expiring memberships get ahead-of-time outreach. Former members worth reactivating land in one queue.",
  },
  {
    title: "Cash you can trust",
    body: "Every collection recorded. Owner dashboard shows live position: transparency for managers, control for owners.",
  },
  {
    title: "Leads that don't die in chat",
    body: "Enquiries captured and followed up so the gym across the street doesn't get them by default.",
  },
  {
    title: "Check-in without the clipboard",
    body: "QR membership cards and a phone/tablet kiosk. Attendance that actually matches who walked in.",
  },
];

export function IncludedSection() {
  return (
    <Reveal as="section" aria-label="Everything included" className="lp-section">
      <span className="lp-section-label">Everything included</span>
      <h2
        className="lp-heading-lg"
        style={{
          textAlign: "center",
          fontSize: "clamp(32px, 4vw, 48px)",
          lineHeight: 1.1,
          marginBottom: 16,
        }}
      >
        Not a debt-collection tool.
        <br />
        An operating system for gym revenue.
      </h2>
      <p
        style={{
          textAlign: "center",
          fontSize: 17,
          color: "var(--lp-text-muted)",
          maxWidth: 480,
          margin: "0 auto 48px",
          lineHeight: 1.6,
        }}
      >
        Recovery is the mechanism. The destination is more revenue, fewer
        cancellations, and less admin across collections, retention, and
        day-to-day ops.
      </p>

      <div
        className="lp-included-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {INCLUDED.map((item, i) => (
          <Reveal
            key={item.title}
            delay={i * 60}
            style={{
              background: "var(--lp-bg-card)",
              border: "1px solid var(--lp-border)",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--lp-text-primary)",
                letterSpacing: "-0.02em",
                marginBottom: 10,
                lineHeight: 1.3,
              }}
            >
              {item.title}
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "var(--lp-text-muted)",
                lineHeight: 1.55,
              }}
            >
              {item.body}
            </p>
          </Reveal>
        ))}
      </div>
    </Reveal>
  );
}
