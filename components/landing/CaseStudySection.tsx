"use client";

import { Reveal } from "./Reveal";

const BEFORE = [
  "19 overdue memberships",
  "No automatic reminders",
  "Attendance recorded manually",
  "Owner checking renewals himself",
];

const AFTER = [
  { value: "Rs. 52,400", label: "overdue fees recovered" },
  { value: "9", label: "expiring members renewed" },
  { value: "4", label: "inactive members returned" },
  { value: "6 hrs/wk", label: "admin time saved" },
];

export function CaseStudySection() {
  return (
    <Reveal
      as="section"
      aria-label="Case study"
      className="lp-section"
    >
      <span className="lp-section-label">Case study</span>
      <h2
        className="lp-heading-lg"
        style={{
          textAlign: "center",
          fontSize: "clamp(32px, 4vw, 48px)",
          lineHeight: 1.1,
          marginBottom: 12,
        }}
      >
        Iron Republic, 137 members
      </h2>
      <p
        style={{
          textAlign: "center",
          fontSize: 15,
          color: "var(--lp-text-muted)",
          marginBottom: 40,
        }}
      >
        One gym. Thirty days. Real numbers.
      </p>

      <div
        className="lp-case-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "rgba(220,38,38,0.03)",
            border: "1px solid rgba(127,29,29,0.2)",
            borderRadius: 16,
            padding: 28,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#f87171",
              marginBottom: 20,
            }}
          >
            Before Barbellist
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
            {BEFORE.map((item) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  gap: 10,
                  fontSize: 15,
                  color: "var(--lp-text-primary)",
                  lineHeight: 1.4,
                }}
              >
                <span style={{ color: "#f87171", fontWeight: 700 }}>·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            background: "rgba(27,94,60,0.05)",
            border: "1px solid rgba(20,83,45,0.3)",
            borderRadius: 16,
            padding: 28,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--lp-accent)",
              marginBottom: 20,
            }}
          >
            30 days later
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
            {AFTER.map((item) => (
              <li key={item.label}>
                <div
                  className="num"
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "var(--lp-text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--lp-text-muted)",
                    marginTop: 2,
                  }}
                >
                  {item.label}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <blockquote
        style={{
          maxWidth: 560,
          margin: "40px auto 0",
          padding: "24px 28px",
          background: "var(--lp-bg-card)",
          border: "1px solid var(--lp-border)",
          borderRadius: 16,
          textAlign: "left",
        }}
      >
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.55,
            color: "var(--lp-text-primary)",
            fontWeight: 500,
          }}
        >
          &ldquo;Before Barbellist I kept fees in a register and WhatsApp. In the
          first month we identified 11 overdue memberships worth Rs. 38,500.
          Money I would have left sitting.&rdquo;
        </p>
        <footer
          style={{
            marginTop: 14,
            fontSize: 13,
            color: "var(--lp-text-muted)",
          }}
        >
          Bilal S., Owner, Iron Republic
        </footer>
      </blockquote>
    </Reveal>
  );
}
