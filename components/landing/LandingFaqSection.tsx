"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";

const FAQS = [
  {
    q: "What is the free Gym Revenue Leak Audit?",
    a: "Send us your member sheet (or WhatsApp a summary). We return overdue revenue, memberships expiring soon, inactive members, former members worth reactivating, and an estimated recoverable figure, before you commit to anything.",
  },
  {
    q: "What's included in the Founding Gym offer?",
    a: "We migrate your members and configure Barbellist personally. First 30 days free. Cancel anytime. After that, Founding Gym is Rs. 35,000 per month (up to 150 members included) for the first 50 gyms.",
  },
  {
    q: "What does the Make More Than You Pay Guarantee cover?",
    a: "If Barbellist doesn't recover at least your monthly subscription fee during your first paid month, we refund that month's subscription. The free trial is separate. The guarantee kicks in once billing starts.",
  },
  {
    q: "Do I need special hardware?",
    a: "No. Any phone, tablet, or laptop works as a check-in kiosk. Members scan their QR card. Nothing biometric required to start.",
  },
  {
    q: "Who do I talk to if something breaks?",
    a: "Us. Founders personally onboard every gym. Support questions come to us directly, not a ticket queue or chatbot.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no lock-in, no cancellation fees.",
  },
];

export function LandingFaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Reveal as="section" id="faq" aria-label="FAQ" className="lp-section">
      <span className="lp-section-label">FAQ</span>
      <h2
        className="lp-heading-lg"
        style={{
          textAlign: "center",
          fontSize: "clamp(32px, 4vw, 48px)",
          lineHeight: 1.1,
          marginBottom: 40,
        }}
      >
        Straight answers.
      </h2>

      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div
              key={faq.q}
              style={{
                borderBottom: "1px solid var(--lp-border)",
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  padding: "20px 0",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--lp-text-primary)",
                    lineHeight: 1.35,
                  }}
                >
                  {faq.q}
                </span>
                <span
                  style={{
                    color: "var(--lp-accent)",
                    fontSize: 22,
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                  aria-hidden
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--lp-text-muted)",
                    lineHeight: 1.6,
                    paddingBottom: 20,
                    marginTop: -4,
                  }}
                >
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}
