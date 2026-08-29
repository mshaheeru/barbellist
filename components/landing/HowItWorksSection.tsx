"use client";

import { Search, Zap, LineChart } from "lucide-react";
import { Reveal } from "./Reveal";

const STEPS = [
  {
    num: "01",
    icon: Search,
    title: "FIND",
    body: "Barbellist scans every member, every day. Overdue fees. Missed check-ins. Expiring memberships. Members who haven't visited in 10+ days. Nothing slips through.",
  },
  {
    num: "02",
    icon: Zap,
    title: "RECOVER",
    body: "Automated WhatsApp messages go out. Payment links get sent. Members who were about to leave get a human message that feels personal, sent by your gym, powered by Barbellist.",
  },
  {
    num: "03",
    icon: LineChart,
    title: "PROVE",
    body: "Every rupee recovered is tracked and attributed. You see exactly what Barbellist earned you this month. Not features. Not clicks. Revenue.",
  },
];

export function HowItWorksSection() {
  return (
    <Reveal as="section" id="how-it-works" aria-label="How it works" className="lp-section">
      <span className="lp-section-label">How it works</span>
      <h2
        className="lp-heading-lg"
        style={{
          textAlign: "center",
          fontSize: "clamp(36px, 5vw, 56px)",
          lineHeight: 1.05,
          whiteSpace: "pre-line",
        }}
      >
        {"One closed loop.\nNo leaks."}
      </h2>
      <p
        style={{
          textAlign: "center",
          fontSize: 17,
          color: "var(--lp-text-muted)",
          maxWidth: 480,
          margin: "16px auto 0",
          lineHeight: 1.6,
        }}
      >
        Barbellist finds the money your gym is losing and automates the work
        needed to recover it.
      </p>

      <div className="lp-steps">
        <span className="lp-step-arrow lp-step-arrow-1" aria-hidden>
          →
        </span>
        <span className="lp-step-arrow lp-step-arrow-2" aria-hidden>
          →
        </span>
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <Reveal key={step.title} delay={i * 100} className="lp-step-card">
              <span className="lp-step-num" aria-hidden>
                {step.num}
              </span>
              <Icon
                size={28}
                color="var(--lp-accent)"
                strokeWidth={1.75}
                style={{ marginBottom: 20 }}
              />
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "var(--lp-text-primary)",
                  marginBottom: 12,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--lp-text-muted)",
                  lineHeight: 1.6,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {step.body}
              </p>
            </Reveal>
          );
        })}
      </div>
    </Reveal>
  );
}
