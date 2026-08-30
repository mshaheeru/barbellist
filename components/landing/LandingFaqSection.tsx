"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { useCurrency } from "./CurrencyProvider";

export function LandingFaqSection() {
  const { earlyRate, earlyMin, memberCap } = useCurrency();
  const [open, setOpen] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is the free revenue audit?",
      a: "A short form about your members, fees, overdue accounts, and renewals. You get a rough estimate of monthly revenue at risk. We save your answers and follow up personally. No software install required.",
    },
    {
      q: "What's included in the Founding Gym offer?",
      a: `We migrate your members and configure Barbellist personally. First 30 days free. Cancel anytime. Then it's ${earlyRate} per active member per month (minimum ${earlyMin}). Custom pricing for ${memberCap}+ members. First 50 gyms only.`,
    },
    {
      q: "Who counts as an active member?",
      a: "Only active paid memberships. Former members, leads, staff, and archived records don't count toward billing.",
    },
    {
      q: "What does the Make More Than You Pay Guarantee cover?",
      a: "If Barbellist doesn't recover at least your subscription during your first paid month, we refund that month. The free trial is separate. The guarantee kicks in once billing starts.",
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
        {faqs.map((faq, i) => {
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
