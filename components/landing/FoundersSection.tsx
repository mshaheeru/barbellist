"use client";

import Image from "next/image";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Reveal } from "./Reveal";

const FOUNDERS = [
  {
    name: "Muhammad Mashhood",
    shortName: "Mashhood",
    role: "Founder, Barbellist",
    line: "IBA Karachi CS grad. Built and shipped real products since 2021 — now building the ops stack that stops your gym from quietly leaking money.",
    photo: "/founders/mashhood.avif",
    linkedin: "https://www.linkedin.com/in/mashhood00/",
  },
  {
    name: "M. Shaheer Uddin",
    shortName: "Shaheer",
    role: "Co-founder, Barbellist",
    line: "IBA Karachi CS ’23. Years shipping software at agencies and a global company — now building tools independent gyms actually need, not enterprise shelfware.",
    photo: "/founders/shaheer.jpeg",
    linkedin: "https://www.linkedin.com/in/mshaheeruddin/",
  },
];

export function FoundersSection() {
  return (
    <Reveal as="div">
      <section
        aria-label="Founders"
        style={{
          maxWidth: 896,
          margin: "0 auto",
          padding: "96px 32px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2
            className="lp-heading-md"
            style={{
              fontSize: 36,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              fontWeight: 800,
              color: "#173D28",
              marginBottom: 14,
            }}
          >
            Built in Karachi. By people who get it.
          </h2>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "#fff",
              border: "1px solid #EEE9DE",
              borderRadius: 100,
              padding: "8px 16px 8px 10px",
              boxShadow: "0 8px 24px -18px rgba(23,61,40,.3)",
            }}
          >
            <Image
              src="/founders/iba-karachi-logo.avif"
              alt="IBA Karachi"
              width={28}
              height={28}
              style={{ objectFit: "contain" }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#54524B",
                letterSpacing: "0.01em",
              }}
            >
              Both Computer Science · IBA Karachi
            </span>
          </div>
        </div>

        <div
          className="lp-grid-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 22,
          }}
        >
          {FOUNDERS.map((f) => (
            <article
              key={f.name}
              className="lp-founder-card"
              style={{
                background: "#FAF7F2",
                borderRadius: 18,
                boxShadow: "0 18px 44px -28px rgba(23,61,40,.38)",
                border: "1px solid #EEE9DE",
                padding: "36px 28px 30px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                transition: "transform .22s ease, box-shadow .22s ease",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 112,
                  height: 112,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: -4,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(145deg, rgba(27,94,60,.35), rgba(201,134,27,.45))",
                  }}
                  aria-hidden
                />
                <div
                  style={{
                    position: "relative",
                    width: 112,
                    height: 112,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "3px solid #FAF7F2",
                    background: "#EDE8DD",
                  }}
                >
                  <Image
                    src={f.photo}
                    alt={f.name}
                    fill
                    sizes="112px"
                    style={{ objectFit: "cover", objectPosition: "center top" }}
                  />
                </div>
              </div>

              <h3
                style={{
                  fontSize: 21,
                  fontWeight: 700,
                  color: "#1B5E3C",
                  letterSpacing: "-0.02em",
                  marginBottom: 4,
                }}
              >
                {f.name}
              </h3>
              <p
                style={{
                  fontSize: 13.5,
                  color: "#8A877E",
                  fontWeight: 500,
                  marginBottom: 14,
                }}
              >
                {f.role}
              </p>

              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: "#3A3A38",
                  maxWidth: "34ch",
                  flex: 1,
                }}
              >
                {f.line}
              </p>

              <a
                href={f.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${f.shortName} on LinkedIn`}
                style={{
                  marginTop: 20,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1B5E3C",
                  textDecoration: "none",
                  padding: "8px 14px",
                  borderRadius: 10,
                  background: "rgba(27,94,60,.06)",
                  border: "1px solid rgba(27,94,60,.12)",
                  transition: "background .18s, border-color .18s",
                }}
                className="lp-founder-linkedin"
              >
                <LinkedInIcon />
                LinkedIn
              </a>

              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 3,
                  background: "linear-gradient(90deg,#C9861B,#E7B24E)",
                }}
              />
            </article>
          ))}
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 16,
            color: "#54524B",
            marginTop: 40,
            fontWeight: 500,
          }}
        >
          We answer support questions personally. Not a chatbot. Not a ticket
          system. Us.
        </p>
        <p style={{ textAlign: "center", marginTop: 14 }}>
          <a
            href={getWhatsAppUrl(
              "Hi Shaheer — I have a question about Barbellist.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#1B5E3C",
              textDecoration: "none",
            }}
          >
            💬 WhatsApp Shaheer directly: +92 336 7808477
          </a>
        </p>
      </section>
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
