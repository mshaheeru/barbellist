"use client";

import Image from "next/image";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Reveal } from "./Reveal";

const FOUNDERS = [
  {
    name: "Muhammad Mashhood",
    shortName: "Mashhood",
    role: "Founder, Barbellist",
    line: "Ships product and answers when billing breaks on a Monday morning.",
    cred: "IBA CS · building since 2021",
    photo: "/founders/mashhood.avif",
    linkedin: "https://www.linkedin.com/in/mashhood00/",
  },
  {
    name: "M. Shaheer Uddin",
    shortName: "Shaheer",
    role: "Co-founder, Barbellist",
    line: "Onboards every gym personally. Your WhatsApp reaches him, not a queue.",
    cred: "IBA CS · agency & global product experience",
    photo: "/founders/shaheer.jpeg",
    linkedin: "https://www.linkedin.com/in/mshaheeruddin/",
  },
];

export function FoundersSection() {
  return (
    <Reveal as="section" aria-label="Founders" className="lp-section">
      <h2
        className="lp-heading-lg"
        style={{
          textAlign: "center",
          fontSize: "clamp(32px, 4vw, 48px)",
          lineHeight: 1.1,
          marginBottom: 16,
        }}
      >
        Your gym won&apos;t be handed to a support queue.
      </h2>
      <p
        style={{
          textAlign: "center",
          fontSize: 17,
          color: "var(--lp-text-muted)",
          maxWidth: 440,
          margin: "0 auto 48px",
          lineHeight: 1.6,
        }}
      >
        We personally onboard every gym. Every support question comes to us
        directly. Not a chatbot.
      </p>

      <div
        className="lp-founders-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 22,
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        {FOUNDERS.map((f) => (
          <article
            key={f.name}
            className="lp-founder-card"
            style={{
              background: "var(--lp-bg-card)",
              borderRadius: 16,
              border: "1px solid var(--lp-border)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              transition: "border-color 0.3s ease",
            }}
          >
            <div
              style={{
                position: "relative",
                width: 80,
                height: 80,
                marginBottom: 16,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid var(--lp-border)",
                background: "var(--lp-bg-card-hover)",
              }}
            >
              <Image
                src={f.photo}
                alt={f.name}
                fill
                sizes="80px"
                style={{ objectFit: "cover", objectPosition: "center top" }}
              />
            </div>

            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--lp-text-primary)",
                letterSpacing: "-0.02em",
                marginBottom: 4,
              }}
            >
              {f.name}
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "var(--lp-accent)",
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              {f.role}
            </p>

            <p
              style={{
                fontSize: 14,
                lineHeight: 1.55,
                color: "var(--lp-text-primary)",
                maxWidth: "34ch",
                flex: 1,
              }}
            >
              {f.line}
            </p>
            <p
              style={{
                fontSize: 12,
                color: "var(--lp-text-muted)",
                marginTop: 10,
              }}
            >
              {f.cred}
            </p>

            <a
              href={f.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${f.shortName} on LinkedIn`}
              style={{
                marginTop: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--lp-text-muted)",
                textDecoration: "none",
                padding: "8px 14px",
                borderRadius: 8,
                background: "var(--lp-white-5)",
                border: "1px solid var(--lp-white-10)",
                transition: "background 0.18s, border-color 0.18s",
              }}
              className="lp-founder-linkedin"
            >
              <LinkedInIcon />
              LinkedIn
            </a>
          </article>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 40 }}>
        <a
          href={getWhatsAppUrl(
            "Hi Shaheer, I have a question about Barbellist.",
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="lp-btn-nav-wa"
          style={{ padding: "12px 24px", fontSize: 14 }}
        >
          💬 WhatsApp Shaheer: +92 336 7808477
        </a>
      </div>
    </Reveal>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
