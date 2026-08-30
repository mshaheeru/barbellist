"use client";

import { Reveal } from "./Reveal";

const LEAKS = [
  {
    heading: "Overdue fees you're too awkward to chase",
    body: "6 weeks pass. You see them every day. You say nothing. They owe Rs. 4,200.",
    pulse: true,
  },
  {
    heading: "Members who quietly stopped coming",
    body: "They're 'active' in your register. They cancelled in their head 3 weeks ago.",
    pulse: false,
  },
  {
    heading: "Cash that doesn't add up at month end",
    body: "Collected at the desk. Recorded somewhere. The total never matches.",
    pulse: false,
  },
  {
    heading: "Leads who enquired and vanished",
    body: "They WhatsApped asking about membership. Nobody followed up. They joined the gym across the street.",
    pulse: false,
  },
];

export function LeakSection() {
  return (
    <Reveal as="section" aria-label="The problem" className="lp-section">
      <span className="lp-section-label">The problem</span>
      <h2
        className="lp-heading-lg"
        style={{
          textAlign: "center",
          fontSize: "clamp(36px, 6vw, 60px)",
          lineHeight: 1.05,
          marginBottom: 16,
        }}
      >
        Rs. 15,000–20,000.
      </h2>
      <p
        style={{
          textAlign: "center",
          fontSize: 20,
          color: "var(--lp-text-muted)",
          maxWidth: 520,
          margin: "0 auto",
          lineHeight: 1.6,
        }}
      >
        The average amount an independent gym leaks every month. Silently.
        Invisibly. From five predictable places.
      </p>

      <div className="lp-bento">
        {LEAKS.map((card, i) => (
          <Reveal
            key={card.heading}
            delay={i * 80}
            className="lp-bento-card"
          >
            {card.pulse && (
              <span
                aria-hidden
                className="lp-pulse-dot"
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ef4444",
                  marginBottom: 14,
                }}
              />
            )}
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--lp-text-primary)",
                letterSpacing: "-0.02em",
                marginBottom: 10,
                lineHeight: 1.3,
              }}
            >
              {card.heading}
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "var(--lp-text-muted)",
                lineHeight: 1.55,
              }}
            >
              {card.body}
            </p>
          </Reveal>
        ))}

      </div>

      <Reveal delay={400} className="lp-leak-close">
        <p className="lp-leak-close-text">
          This isn&apos;t a people problem. It&apos;s a systems problem.
          <br />
          Barbellist gives your gym the system.
        </p>
      </Reveal>
    </Reveal>
  );
}
