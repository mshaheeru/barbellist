"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { Reveal } from "./Reveal";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { FoundersSection } from "./FoundersSection";
import { LeakSection } from "./LeakSection";
import { GymWithBarbellistSection } from "./GymWithBarbellistSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { PricingSection } from "./PricingSection";
import { ProductPreviewSection } from "./ProductPreviewSection";
import { IncludedSection } from "./IncludedSection";
import { LandingFaqSection } from "./LandingFaqSection";
import { RevenueAuditModal } from "./RevenueAuditModal";
import { CurrencyProvider } from "./CurrencyProvider";
import { LogoLockupReversed } from "@/components/brand/logo";

const CONTENT_MAX = 1240;

const NAV_LINK: CSSProperties = {
  color: "var(--lp-text-muted)",
  padding: "8px 12px",
  fontSize: 14,
  fontWeight: 500,
  borderRadius: 8,
  transition: "color 0.18s",
};

export function LandingPage() {
  return (
    <CurrencyProvider>
      <LandingInner />
    </CurrencyProvider>
  );
}

function LandingInner() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);

  const openAudit = () => {
    setMenuOpen(false);
    setAuditOpen(true);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#audit") {
      setAuditOpen(true);
    }
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing">
      <WhatsAppFloat />
      <RevenueAuditModal
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
      />

      <nav
        aria-label="Primary"
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "saturate(160%) blur(16px)",
          WebkitBackdropFilter: "saturate(160%) blur(16px)",
          borderBottom: "1px solid var(--lp-white-5)",
        }}
      >
        <div
          className="lp-nav-inner"
          style={{
            maxWidth: CONTENT_MAX,
            margin: "0 auto",
            padding: "0 32px",
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <a
            href="#top"
            className="lp-logo"
            onClick={closeMenu}
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <LogoLockupReversed height={28} href={null} />
          </a>
          <div
            className="lp-nav-desktop"
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <a href="#how-it-works" className="nav-link" style={NAV_LINK}>
              How it works
            </a>
            <a href="#with-barbellist" className="nav-link" style={NAV_LINK}>
              Your gym
            </a>
            <a href="#pricing" className="nav-link" style={NAV_LINK}>
              Pricing
            </a>
            <Link href="/login" className="nav-link" style={NAV_LINK}>
              Sign In
            </Link>
            <button
              type="button"
              onClick={openAudit}
              className="lp-btn-nav-wa"
              style={{ marginLeft: 8 }}
            >
              Get free audit
            </button>
          </div>
          <button
            type="button"
            className="lp-menu-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
        {menuOpen && (
          <div className="lp-mobile-drawer">
            <a href="#how-it-works" onClick={closeMenu}>
              How it works
            </a>
            <a href="#with-barbellist" onClick={closeMenu}>
              Your gym
            </a>
            <a href="#pricing" onClick={closeMenu}>
              Pricing
            </a>
            <Link href="/login" onClick={closeMenu}>
              Sign In
            </Link>
            <button
              type="button"
              onClick={openAudit}
              className="lp-mobile-order"
            >
              Get free audit
            </button>
          </div>
        )}
      </nav>

      <main>
        <HeroSection onOpenAudit={openAudit} />
        <GymWithBarbellistSection />
        <LeakSection />
        <HowItWorksSection />
        <ProductPreviewSection />
        <IncludedSection />
        <FoundersSection />
        <PricingSection onOpenAudit={openAudit} />
        <LandingFaqSection />
        <FinalCtaSection onOpenAudit={openAudit} />
      </main>

      <FooterSection onOpenAudit={openAudit} />
    </div>
  );
}

function HeroSection({ onOpenAudit }: { onOpenAudit: () => void }) {
  return (
    <header id="top" className="lp-hero">
      <div
        className="lp-hero-grid"
        style={{ gridTemplateColumns: "1fr", maxWidth: 680, textAlign: "left" }}
      >
        <div>
          <span className="lp-hero-pill">Gym Revenue Recovery System</span>
          <p
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--lp-text-muted)",
              marginBottom: 16,
              letterSpacing: "-0.01em",
            }}
          >
            More revenue. Fewer cancellations. Less admin.
          </p>
          <h1 className="lp-hero-h1" style={{ fontSize: "clamp(40px, 7vw, 72px)" }}>
            Your gym is making more money than you&apos;re collecting.
          </h1>
          <p className="lp-hero-sub">
            Missed renewals. Overdue fees. Members quietly disappearing. Leads
            nobody followed up with. Barbellist finds the revenue leaks and helps
            your team recover them automatically.
          </p>
          <div className="lp-hero-ctas">
            <button
              type="button"
              onClick={onOpenAudit}
              className="lp-btn-primary"
            >
              Get my free revenue audit →
            </button>
            <a href="#how-it-works" className="lp-btn-secondary">
              How it works
            </a>
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--lp-text-muted)",
              marginTop: 16,
            }}
          >
            Free Revenue Leak Audit · No card required
          </p>

          <div
            id="audit"
            style={{
              marginTop: 40,
              padding: 24,
              background: "var(--lp-bg-card)",
              border: "1px solid var(--lp-border)",
              borderRadius: 16,
              maxWidth: 520,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--lp-accent)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Free revenue audit
            </div>
            <p
              style={{
                fontSize: 15,
                color: "var(--lp-text-muted)",
                lineHeight: 1.55,
                marginBottom: 14,
              }}
            >
              Tell us your member count, fees, and overdue renewals. Get a rough
              estimate of monthly revenue at risk, then we follow up personally.
            </p>
            <button
              type="button"
              onClick={onOpenAudit}
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--lp-accent)",
                textDecoration: "none",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Start the free audit →
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function FinalCtaSection({ onOpenAudit }: { onOpenAudit: () => void }) {
  return (
    <section
      aria-label="Get started"
      style={{
        background:
          "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(201,134,27,0.06) 0%, transparent 60%), #0A0A0A",
        padding: "128px 32px",
        textAlign: "center",
      }}
      className="lp-final-cta"
    >
      <Reveal variant="scale" style={{ maxWidth: 640, margin: "0 auto" }}>
        <h2
          className="lp-heading-lg"
          style={{
            fontSize: "clamp(40px, 7vw, 64px)",
            lineHeight: 1.05,
            textAlign: "center",
          }}
        >
          Your paper register
          <br />
          <span style={{ color: "var(--lp-accent)" }}>won&apos;t miss you.</span>
        </h2>
        <p
          style={{
            fontSize: 18,
            color: "var(--lp-text-muted)",
            marginTop: 20,
            lineHeight: 1.6,
          }}
        >
          Start with a free revenue audit. We migrate your members personally.
          You only pay when you&apos;re ready to keep going.
        </p>
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 36,
          }}
        >
          <button
            type="button"
            onClick={onOpenAudit}
            className="lp-btn-primary"
          >
            Get my free revenue audit →
          </button>
          <Link href="/signup" className="lp-btn-secondary">
            Start founding trial
          </Link>
        </div>
        <p
          style={{
            fontSize: 14,
            color: "var(--lp-text-muted)",
            marginTop: 16,
          }}
        >
          Free Revenue Leak Audit · No card required
        </p>
        <div
          style={{
            display: "inline-block",
            marginTop: 28,
            background: "var(--lp-accent-glow)",
            border: "1px solid rgba(201,134,27,0.2)",
            borderRadius: 999,
            padding: "8px 24px",
            fontSize: 14,
            color: "var(--lp-accent)",
            fontWeight: 600,
          }}
        >
          ⚡ Founding offer closes when 50 gyms join
        </div>
      </Reveal>
    </section>
  );
}

function FooterSection({ onOpenAudit }: { onOpenAudit: () => void }) {
  const columns = [
    {
      title: "Product",
      links: [
        { label: "How it works", href: "#how-it-works" },
        { label: "Your gym", href: "#with-barbellist" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "FAQ", href: "#faq" },
        { label: "Contact", href: getWhatsAppUrl() },
      ],
    },
    {
      title: "Resources",
      links: [{ label: "Full FAQ", href: "/faq" }],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms", href: "#top" },
        { label: "Privacy", href: "#top" },
      ],
    },
  ];

  return (
    <footer
      style={{
        background: "#050505",
        borderTop: "1px solid var(--lp-border)",
        color: "var(--lp-text-muted)",
      }}
    >
      <div className="lp-footer-grid">
        <div className="lp-footer-brand">
          <LogoLockupReversed height={28} href="/home" />
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.55,
              color: "var(--lp-text-muted)",
              marginTop: 14,
              maxWidth: "32ch",
            }}
          >
            More revenue. Fewer cancellations. Less admin. Powered by a Gym
            Revenue Recovery System.
          </p>
          <button
            type="button"
            onClick={onOpenAudit}
            style={{
              marginTop: 16,
              background: "none",
              border: "none",
              padding: 0,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--lp-accent)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Free revenue audit →
          </button>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {[
              {
                label: "IG",
                href: "https://www.instagram.com/_barbellist/",
                aria: "Barbellist on Instagram",
              },
              {
                label: "FB",
                href: "https://www.facebook.com/profile.php?id=61592842377915",
                aria: "Barbellist on Facebook",
              },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.aria}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: "var(--lp-white-5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--lp-text-muted)",
                  textDecoration: "none",
                }}
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--lp-text-muted)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              {col.title}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 11,
                fontSize: 14,
              }}
            >
              {col.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  style={{ color: "var(--lp-text-muted)" }}
                  {...(link.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--lp-border)" }}>
        <div
          style={{
            maxWidth: CONTENT_MAX,
            margin: "0 auto",
            padding: "20px 32px",
            fontSize: 13,
            color: "var(--lp-text-muted)",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>© 2026 Barbellist. All rights reserved.</span>
          <span>Made with ❤️</span>
        </div>
      </div>
    </footer>
  );
}
