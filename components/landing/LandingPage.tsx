"use client";

import { useEffect, useState } from "react";
import { faqData } from "./landing-data";
import { ChartBars, CheckIcon, QrDots } from "./landing-helpers";
import { VideoModal } from "./VideoModal";
import { OrderModal } from "./OrderModal";
import { SalesContactModal } from "./SalesContactModal";
import { Reveal } from "./Reveal";

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [salesOpen, setSalesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const s = window.scrollY > 20;
      setScrolled((prev) => (prev !== s ? s : prev));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const navBg =
    scrolled || menuOpen
      ? "rgba(250,247,242,.96)"
      : "rgba(250,247,242,0)";
  const navBorder = scrolled || menuOpen ? "#E7E2D6" : "transparent";
  const navShadow = scrolled
    ? "0 1px 0 rgba(23,61,40,.04), 0 8px 24px -18px rgba(23,61,40,.28)"
    : "none";

  return (
    <div className="landing">
      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
      <OrderModal open={orderOpen} onClose={() => setOrderOpen(false)} />
      <SalesContactModal open={salesOpen} onClose={() => setSalesOpen(false)} />
      {/* NAV */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: navBg,
          backdropFilter: "saturate(160%) blur(16px)",
          WebkitBackdropFilter: "saturate(160%) blur(16px)",
          borderBottom: `1px solid ${navBorder}`,
          transition: "background .25s,border-color .25s,box-shadow .25s",
          boxShadow: navShadow,
        }}
      >
        <div
          className="lp-nav-inner"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 32px",
            height: 82,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <a
            href="#top"
            className="lp-logo"
            onClick={closeMenu}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 0,
              fontWeight: 800,
              fontSize: 30,
              letterSpacing: "-0.02em",
              color: "#1B5E3C",
            }}
          >
            Barbell
            <span style={{ position: "relative", paddingBottom: 6 }}>
              ist
              <span
                style={{
                  position: "absolute",
                  left: -1,
                  bottom: 0,
                  width: "calc(100% + 2px)",
                  height: 5,
                  background: "linear-gradient(90deg,#C9861B,#E7B24E)",
                  borderRadius: 3,
                  boxShadow: "0 1px 4px rgba(201,134,27,.45)",
                }}
              />
            </span>
          </a>
          <div
            className="lp-nav-desktop"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 14.5,
                fontWeight: 500,
                color: "#3A3A38",
              }}
            >
              <a
                href="#features"
                className="nav-link"
                style={{
                  color: "#4A4A46",
                  padding: "8px 15px",
                  borderRadius: 8,
                  transition: "color .18s,background .18s",
                }}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="nav-link"
                style={{
                  color: "#4A4A46",
                  padding: "8px 15px",
                  borderRadius: 8,
                  transition: "color .18s,background .18s",
                }}
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="nav-link"
                style={{
                  color: "#4A4A46",
                  padding: "8px 15px",
                  borderRadius: 8,
                  transition: "color .18s,background .18s",
                }}
              >
                Docs
              </a>
            </div>
            <button
              type="button"
              onClick={() => setOrderOpen(true)}
              className="nav-cta"
              style={{
                marginLeft: 8,
                background: "#1B5E3C",
                color: "#FAF7F2",
                padding: "11px 22px",
                borderRadius: 11,
                fontSize: 14.5,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                boxShadow: "0 2px 8px rgba(27,94,60,.32)",
                transition: "transform .18s,box-shadow .18s,background .18s",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Order Now
              <span
                style={{
                  fontSize: 15,
                  lineHeight: 1,
                  transition: "transform .18s",
                }}
              >
                →
              </span>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
        {menuOpen && (
          <div className="lp-mobile-drawer">
            <a href="#features" onClick={closeMenu}>
              Features
            </a>
            <a href="#pricing" onClick={closeMenu}>
              Pricing
            </a>
            <a href="#faq" onClick={closeMenu}>
              Docs
            </a>
            <button
              type="button"
              className="lp-mobile-order"
              onClick={() => {
                closeMenu();
                setOrderOpen(true);
              }}
            >
              Order Now →
            </button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <header
        id="top"
        style={{
          position: "relative",
          background: "#FAF7F2",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 620,
            height: 620,
            background:
              "radial-gradient(circle,rgba(201,134,27,.16),transparent 62%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 180,
            left: -160,
            width: 520,
            height: 520,
            background:
              "radial-gradient(circle,rgba(27,94,60,.09),transparent 62%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="lp-hero-pad"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "48px 32px 96px",
            position: "relative",
          }}
        >
          <div style={{ maxWidth: 820 }} className="lp-hero-in">
            <h1
              className="lp-hero-h1"
              style={{
                fontSize: 40,
                lineHeight: 1.28,
                letterSpacing: "-0.02em",
                fontWeight: 600,
                color: "#2A2A28",
                maxWidth: "24ch",
              }}
            >
              Gym chalana tha, spreadsheets nahi. Barbellist sab sambhal leta
              hai. Apna{" "}
              <strong style={{ fontWeight: 800, color: "#C9861B" }}>
                weekend
              </strong>{" "}
              wapas lo.
            </h1>
            <div
              className="lp-hero-ctas lp-hero-in-delay"
              style={{
                display: "flex",
                gap: 14,
                marginTop: 34,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setOrderOpen(true)}
                style={{
                  background: "#1B5E3C",
                  color: "#FAF7F2",
                  padding: "15px 26px",
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  boxShadow: "0 6px 18px rgba(27,94,60,.28)",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Order Now
              </button>
              <button
                type="button"
                onClick={() => setVideoOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  background: "#fff",
                  color: "#1B5E3C",
                  padding: "15px 24px",
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  border: "1px solid #DDD8CC",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#1B5E3C",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: "7px solid #FAF7F2",
                      borderTop: "4.5px solid transparent",
                      borderBottom: "4.5px solid transparent",
                      marginLeft: 2,
                    }}
                  />
                </span>
                Watch 2-min demo
              </button>
            </div>
            <p style={{ fontSize: 14, color: "#8A877E", marginTop: 20 }}>
              Free for your first 3 months · No setup fees · Cancel anytime
            </p>
          </div>

          {/* hero visuals */}
          <div
            className="lp-hero-visuals lp-hero-in-delay-2"
            style={{ position: "relative", marginTop: 64, height: 520 }}
          >
            {/* secondary floating card (QR kiosk) */}
            <div
              className="lp-kiosk"
              style={{
                position: "absolute",
                right: 20,
                top: 36,
                width: 300,
                transform: "rotate(4deg)",
                animation: "floaty 7s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  boxShadow: "0 30px 60px -20px rgba(23,61,40,.35)",
                  border: "1px solid #EDE8DD",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#173D28",
                    padding: "16px 18px",
                    color: "#EBF3ED",
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  Check-in kiosk
                  <span style={{ opacity: 0.6, fontWeight: 500 }}>08:41</span>
                </div>
                <div style={{ padding: "26px 22px", textAlign: "center" }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "#E7F3EC",
                      margin: "0 auto 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 12,
                        borderLeft: "3px solid #1B5E3C",
                        borderBottom: "3px solid #1B5E3C",
                        transform: "rotate(-45deg)",
                        marginTop: -6,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#173D28",
                    }}
                  >
                    Welcome back, Hamza
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 8,
                      background: "#E7F3EC",
                      color: "#1B5E3C",
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "5px 12px",
                      borderRadius: 100,
                    }}
                  >
                    Fees paid · valid to 30 Aug
                  </div>
                  <div
                    style={{
                      marginTop: 20,
                      height: 96,
                      borderRadius: 12,
                      background:
                        "repeating-linear-gradient(45deg,#F2EEE4,#F2EEE4 6px,#fff 6px,#fff 12px)",
                      border: "1px solid #EDE8DD",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <QrDots />
                  </div>
                </div>
              </div>
            </div>

            {/* main dashboard screenshot */}
            <div
              className="lp-dashboard"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 760,
                transform: "rotate(-2deg)",
              }}
            >
              <div className="lp-dash-scroll">
              <div
                className="lp-dash-shell"
                style={{
                  background: "#fff",
                  borderRadius: 22,
                  boxShadow: "0 40px 80px -28px rgba(23,61,40,.4)",
                  border: "1px solid #ECE7DC",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "13px 16px",
                    borderBottom: "1px solid #F0EDE4",
                    background: "#FBF9F4",
                  }}
                >
                  <span
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: "50%",
                      background: "#E6E2D8",
                    }}
                  />
                  <span
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: "50%",
                      background: "#E6E2D8",
                    }}
                  />
                  <span
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: "50%",
                      background: "#E6E2D8",
                    }}
                  />
                  <span
                    style={{ marginLeft: 14, fontSize: 12, color: "#A29E93" }}
                  >
                    app.barbellist.com/dashboard
                  </span>
                </div>
                <div style={{ display: "flex", minHeight: 400 }}>
                  <div
                    style={{
                      width: 190,
                      background: "#173D28",
                      padding: "20px 16px",
                      color: "#B9CFC1",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        color: "#fff",
                        fontSize: 16,
                        letterSpacing: "-0.02em",
                        marginBottom: 22,
                      }}
                    >
                      Barbell<span style={{ color: "#E7B24E" }}>ist</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        fontSize: 13,
                      }}
                    >
                      <div
                        style={{
                          background: "rgba(255,255,255,.12)",
                          color: "#fff",
                          padding: "8px 11px",
                          borderRadius: 8,
                          fontWeight: 600,
                        }}
                      >
                        Dashboard
                      </div>
                      <div style={{ padding: "8px 11px" }}>Members</div>
                      <div style={{ padding: "8px 11px" }}>Attendance</div>
                      <div style={{ padding: "8px 11px" }}>Payments</div>
                      <div style={{ padding: "8px 11px" }}>Expenses</div>
                      <div style={{ padding: "8px 11px" }}>Inventory</div>
                      <div style={{ padding: "8px 11px" }}>Staff</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: "22px 24px", background: "#fff" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 20,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#1F1F1F",
                          }}
                        >
                          Good morning, Bilal
                        </div>
                        <div style={{ fontSize: 13, color: "#9A968B" }}>
                          Iron Republic · Karachi · August 2026
                        </div>
                      </div>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: "#EDE8DD",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 12,
                        marginBottom: 18,
                      }}
                    >
                      <div
                        style={{
                          background: "#F7F5EF",
                          border: "1px solid #EEEAE0",
                          borderRadius: 12,
                          padding: 14,
                        }}
                      >
                        <div style={{ fontSize: 12, color: "#8E8A7F" }}>
                          Revenue
                        </div>
                        <div
                          className="num"
                          style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: "#1B5E3C",
                            marginTop: 4,
                          }}
                        >
                          $8,420
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#1B5E3C",
                            fontWeight: 600,
                            marginTop: 2,
                          }}
                        >
                          ▲ 12%
                        </div>
                      </div>
                      <div
                        style={{
                          background: "#F7F5EF",
                          border: "1px solid #EEEAE0",
                          borderRadius: 12,
                          padding: 14,
                        }}
                      >
                        <div style={{ fontSize: 12, color: "#8E8A7F" }}>
                          Expenses
                        </div>
                        <div
                          className="num"
                          style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: "#1F1F1F",
                            marginTop: 4,
                          }}
                        >
                          $3,180
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#9A968B",
                            fontWeight: 600,
                            marginTop: 2,
                          }}
                        >
                          — utilities
                        </div>
                      </div>
                      <div
                        style={{
                          background: "#173D28",
                          borderRadius: 12,
                          padding: 14,
                        }}
                      >
                        <div style={{ fontSize: 12, color: "#9DBBAB" }}>
                          Net profit
                        </div>
                        <div
                          className="num"
                          style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: "#fff",
                            marginTop: 4,
                          }}
                        >
                          $5,240
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#E7B24E",
                            fontWeight: 600,
                            marginTop: 2,
                          }}
                        >
                          ▲ 18%
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.5fr 1fr",
                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          border: "1px solid #EEEAE0",
                          borderRadius: 12,
                          padding: 16,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#54524B",
                            marginBottom: 14,
                          }}
                        >
                          Revenue vs expenses
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-end",
                            gap: 10,
                            height: 120,
                          }}
                        >
                          <ChartBars />
                        </div>
                      </div>
                      <div
                        style={{
                          border: "1px solid #EEEAE0",
                          borderRadius: 12,
                          padding: 16,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#54524B",
                            marginBottom: 12,
                          }}
                        >
                          At-risk members
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  background: "#EDE8DD",
                                }}
                              />
                              <div style={{ fontSize: 12 }}>Adnan R.</div>
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#B4451F",
                                fontWeight: 600,
                                background: "#FBEBE4",
                                padding: "2px 8px",
                                borderRadius: 100,
                              }}
                            >
                              7d overdue
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  background: "#EDE8DD",
                                }}
                              />
                              <div style={{ fontSize: 12 }}>Sana K.</div>
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#B4451F",
                                fontWeight: 600,
                                background: "#FBEBE4",
                                padding: "2px 8px",
                                borderRadius: 100,
                              }}
                            >
                              3d overdue
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  background: "#EDE8DD",
                                }}
                              />
                              <div style={{ fontSize: 12 }}>Usman T.</div>
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#9A6A12",
                                fontWeight: 600,
                                background: "#F7EBD3",
                                padding: "2px 8px",
                                borderRadius: 100,
                              }}
                            >
                              expires 2d
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* PROBLEM → SOLUTION */}
      <Reveal
        as="section"
        className="lp-section-lg"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 32px" }}
      >
        <div
          className="lp-grid-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 24px 60px -34px rgba(23,61,40,.25)",
          }}
        >
          <div className="lp-split-pad" style={{ background: "#F1EEE6", padding: "56px 48px" }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#B4451F",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              The old way
            </div>
            <h3
              style={{
                fontSize: 30,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                fontWeight: 800,
                color: "#3A3A38",
              }}
            >
              Still tracking members on paper?
            </h3>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.6,
                color: "#6B6862",
                marginTop: 18,
              }}
            >
              Overdue payments go unnoticed for weeks. Members forget renewal
              dates. Cash goes untracked. Expenses live in a drawer. And when
              you want to know if the gym is actually profitable this month,
              you&apos;re doing math on a napkin.
            </p>
          </div>
          <div
            className="lp-split-pad lp-problem-border"
            style={{
              background: "#EBF1EC",
              padding: "56px 48px",
              borderLeft: "1px solid #DCE6DE",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1B5E3C",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              With Barbellist
            </div>
            <h3
              style={{
                fontSize: 30,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                fontWeight: 800,
                color: "#173D28",
              }}
            >
              Barbellist gives you the whole picture.
            </h3>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.6,
                color: "#4C5A50",
                marginTop: 18,
              }}
            >
              Every member, every payment, every expense, every check-in —
              connected in real time. Automated WhatsApp reminders for overdue
              fees. Smart QR membership cards. A live dashboard that shows
              revenue, expenses, and profit at a glance.
            </p>
          </div>
        </div>
      </Reveal>

      {/* FEATURE BENTO - continued in part 2 */}
      <FeaturesSection />
      <RoiSection />
      <DeepDiveSection />
      <PricingSection onTalkToSales={() => setSalesOpen(true)} />
      <TestimonialsSection />
      <FaqSection openFaq={openFaq} setOpenFaq={setOpenFaq} />
      <FinalCtaSection />
      <FooterSection />
    </div>
  );
}

function FeaturesSection() {
  return (
    <Reveal
      as="section"
      id="features"
      className="lp-section"
      style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 32px 96px" }}
    >
      <div style={{ maxWidth: 640, marginBottom: 44 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#C9861B",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          Everything, connected
        </div>
        <h2
          className="lp-heading-lg"
          style={{
            fontSize: 40,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            fontWeight: 800,
            color: "#173D28",
          }}
        >
          One platform for the entire gym.
        </h2>
      </div>

      <div
        className="lp-grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 18,
        }}
      >
        {/* Member Management */}
        <div
          className="lp-span-2"
          style={{
            gridColumn: "span 2",
            background: "#fff",
            border: "1px solid #EEE9DE",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 12px 30px -22px rgba(23,61,40,.35)",
          }}
        >
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1F1F1F" }}>
            Member Management
          </h3>
          <p style={{ fontSize: 15, color: "#6B6862", marginTop: 6 }}>
            Digital profiles that replace the register.
          </p>
          <div
            style={{
              marginTop: 22,
              border: "1px solid #F0EDE4",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 11,
                color: "#9A968B",
                background: "#FBF9F4",
                padding: "9px 14px",
                fontWeight: 600,
              }}
            >
              <span style={{ flex: 2 }}>Member</span>
              <span style={{ flex: 1 }}>Plan</span>
              <span style={{ flex: 1, textAlign: "right" }}>Status</span>
            </div>
            {[
              { name: "Bilal Sheikh", plan: "Annual", status: "Active", statusBg: "#E7F3EC", statusColor: "#1B5E3C" },
              { name: "Sana Kamal", plan: "Monthly", status: "Expiring", statusBg: "#F7EBD3", statusColor: "#9A6A12" },
              { name: "Usman Tariq", plan: "Quarterly", status: "Overdue", statusBg: "#FBEBE4", statusColor: "#B4451F" },
            ].map((row) => (
              <div
                key={row.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 13,
                  padding: "11px 14px",
                  borderTop: "1px solid #F3F0E8",
                }}
              >
                <span
                  style={{
                    flex: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "#EDE8DD",
                    }}
                  />
                  {row.name}
                </span>
                <span style={{ flex: 1, color: "#6B6862" }}>{row.plan}</span>
                <span style={{ flex: 1, textAlign: "right" }}>
                  <span
                    style={{
                      background: row.statusBg,
                      color: row.statusColor,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 9px",
                      borderRadius: 100,
                    }}
                  >
                    {row.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Automated Fee Reminders */}
        <div
          className="lp-span-2"
          style={{
            gridColumn: "span 2",
            background: "#fff",
            border: "1px solid #EEE9DE",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 12px 30px -22px rgba(23,61,40,.35)",
          }}
        >
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1F1F1F" }}>
            Automated Fee Reminders
          </h3>
          <p style={{ fontSize: 15, color: "#6B6862", marginTop: 6 }}>
            WhatsApp reminders that collect for you.
          </p>
          <div
            style={{
              marginTop: 22,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                alignSelf: "flex-start",
                maxWidth: "74%",
                background: "#E7F3EC",
                border: "1px solid #D6E7DC",
                borderRadius: "14px 14px 14px 4px",
                padding: "12px 15px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#1B5E3C",
                  marginBottom: 3,
                }}
              >
                Barbellist · WhatsApp
              </div>
              <div
                style={{ fontSize: 13, color: "#324237", lineHeight: 1.45 }}
              >
                Hi Usman, your Iron Republic membership fee of $28 is 7 days
                overdue. Tap to pay:{" "}
                <span style={{ color: "#1B5E3C", fontWeight: 600 }}>
                  brbl.st/pay
                </span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#8AA593",
                  textAlign: "right",
                  marginTop: 4,
                }}
              >
                Sent automatically · 9:00 AM ✓✓
              </div>
            </div>
            <div
              style={{
                alignSelf: "stretch",
                background: "#FBF9F4",
                border: "1px solid #EFEBE1",
                borderRadius: 12,
                padding: "13px 15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 13, color: "#54524B" }}>
                <span style={{ fontWeight: 600, color: "#1F1F1F" }}>
                  3 reminders
                </span>{" "}
                sent today
              </div>
              <div
                className="num"
                style={{ fontSize: 15, fontWeight: 700, color: "#1B5E3C" }}
              >
                $84 collected
              </div>
            </div>
          </div>
        </div>

        {/* QR Smart Cards */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #EEE9DE",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 12px 30px -22px rgba(23,61,40,.35)",
          }}
        >
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1F1F1F" }}>
            QR Smart Cards
          </h3>
          <p style={{ fontSize: 14, color: "#6B6862", marginTop: 5 }}>
            Auto-generated membership cards in seconds.
          </p>
          <div
            style={{
              marginTop: 20,
              background: "#173D28",
              borderRadius: 12,
              padding: 16,
              color: "#EBF3ED",
              transform: "rotate(-3deg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 13 }}>
                Barbell<span style={{ color: "#E7B24E" }}>ist</span>
              </span>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 5,
                  background:
                    "repeating-linear-gradient(45deg,#EBF3ED,#EBF3ED 2px,#173D28 2px,#173D28 4px)",
                }}
              />
            </div>
            <div style={{ marginTop: 22, fontSize: 14, fontWeight: 600 }}>
              Hamza Iqbal
            </div>
            <div style={{ fontSize: 11, color: "#9DBBAB" }}>
              Member · #IR-2048
            </div>
          </div>
        </div>

        {/* Live Attendance */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #EEE9DE",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 12px 30px -22px rgba(23,61,40,.35)",
          }}
        >
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1F1F1F" }}>
            Live Attendance
          </h3>
          <p style={{ fontSize: 14, color: "#6B6862", marginTop: 5 }}>
            Tap to check in. Fee status shown instantly.
          </p>
          <div
            style={{
              marginTop: 20,
              background: "#EBF1EC",
              border: "1px solid #D9E5DC",
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#1B5E3C",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  width: 15,
                  height: 8,
                  borderLeft: "3px solid #fff",
                  borderBottom: "3px solid #fff",
                  transform: "rotate(-45deg)",
                  marginTop: -4,
                }}
              />
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#173D28",
                marginTop: 10,
              }}
            >
              Checked in
            </div>
            <div style={{ fontSize: 12, color: "#5E7166" }}>
              Fees valid · 08:41
            </div>
          </div>
        </div>

        {/* Expense & Profit */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #EEE9DE",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 12px 30px -22px rgba(23,61,40,.35)",
          }}
        >
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1F1F1F" }}>
            Expense &amp; Profit Tracking
          </h3>
          <p style={{ fontSize: 14, color: "#6B6862", marginTop: 5 }}>
            Know your real profit every day.
          </p>
          <div
            style={{
              marginTop: 20,
              border: "1px solid #F0EDE4",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div
              className="num"
              style={{ fontSize: 22, fontWeight: 700, color: "#1B5E3C" }}
            >
              $5,240
            </div>
            <div
              style={{ fontSize: 11, color: "#8E8A7F", marginBottom: 12 }}
            >
              Net profit · Aug
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 6,
                height: 56,
              }}
            >
              {[44, 60, 52, 78, 92, 100].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    background: i < 3 ? "#DED9CD" : "#1B5E3C",
                    borderRadius: "3px 3px 0 0",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Inventory & POS */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #EEE9DE",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 12px 30px -22px rgba(23,61,40,.35)",
          }}
        >
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1F1F1F" }}>
            Inventory &amp; POS
          </h3>
          <p style={{ fontSize: 14, color: "#6B6862", marginTop: 5 }}>
            Sell supplements and drinks. Add to member tab.
          </p>
          <div
            style={{
              marginTop: 20,
              border: "1px solid #F0EDE4",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 13,
                padding: "11px 14px",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: "#F1EEE6",
                  }}
                />
                Whey Protein 1kg
              </span>
              <span className="num" style={{ fontWeight: 600 }}>
                $34
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 13,
                padding: "11px 14px",
                borderTop: "1px solid #F3F0E8",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: "#F1EEE6",
                  }}
                />
                Energy drink
              </span>
              <span className="num" style={{ fontWeight: 600 }}>
                $3
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 13,
                padding: "11px 14px",
                background: "#EBF1EC",
                borderTop: "1px solid #D9E5DC",
              }}
            >
              <span style={{ fontWeight: 600, color: "#173D28" }}>
                Add to Bilal&apos;s tab
              </span>
              <span
                className="num"
                style={{ fontWeight: 700, color: "#1B5E3C" }}
              >
                $37
              </span>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function RoiSection() {
  const bullets = [
    "It's in the overdue payments you feel too awkward to chase down on the gym floor.",
    "It's in the members who silently quit after their first year because nobody noticed they stopped showing up.",
    "It's in the manual billing errors that slip through the cracks.",
  ];

  return (
    <section
      style={{
        position: "relative",
        background: "#F1EEE6",
        borderTop: "1px solid #E7E2D6",
        borderBottom: "1px solid #E7E2D6",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -60,
          left: "12%",
          width: 340,
          height: 340,
          background:
            "radial-gradient(circle at 50% 40%,rgba(201,134,27,.10),transparent 66%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -40,
          right: "8%",
          width: 300,
          height: 300,
          background:
            "radial-gradient(circle at 50% 40%,rgba(201,134,27,.08),transparent 66%)",
          pointerEvents: "none",
        }}
      />
      <Reveal
        className="lp-section-lg"
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "104px 32px",
          position: "relative",
        }}
      >
        <h2
          className="lp-heading-lg"
          style={{
            fontSize: 42,
            lineHeight: 1.14,
            letterSpacing: "-0.03em",
            fontWeight: 800,
            color: "#173D28",
            maxWidth: "20ch",
          }}
        >
          You are already paying for Barbellist. You just don&apos;t have the
          software yet.
        </h2>
        <p
          style={{
            fontSize: 20,
            lineHeight: 1.5,
            color: "#8A877E",
            marginTop: 18,
          }}
        >
          Right now, your gym is quietly leaking revenue.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 26,
            marginTop: 52,
            maxWidth: 720,
          }}
        >
          {bullets.map((text) => (
            <div
              key={text}
              style={{ display: "flex", gap: 18, alignItems: "flex-start" }}
            >
              <span
                style={{
                  flex: "0 0 auto",
                  marginTop: 3,
                  width: 22,
                  height: 26,
                  display: "inline-block",
                  background: "#C9861B",
                  borderRadius: "0 50% 50% 50%",
                  transform: "rotate(45deg)",
                  boxShadow: "0 3px 8px rgba(201,134,27,.35)",
                }}
              />
              <p
                style={{
                  fontSize: 19,
                  lineHeight: 1.5,
                  color: "#3A3A38",
                }}
              >
                {text}
              </p>
            </div>
          ))}
        </div>

        <p
          style={{
            fontSize: 26,
            lineHeight: 1.35,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#1B5E3C",
            marginTop: 46,
            maxWidth: "26ch",
          }}
        >
          Losing just one member a month to silent churn costs you hundreds of
          dollars a year.
        </p>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.65,
            color: "#54524B",
            marginTop: 34,
            maxWidth: "60ch",
          }}
        >
          For just $50 a month, Barbellist plugs the leaks.{" "}
          <strong style={{ color: "#2A2A28", fontWeight: 700 }}>
            Our automated fee reminders recover your lost revenue without the
            awkward conversations. Our smart-tracking flags at-risk members
            before they quit, saving your retention rate.
          </strong>
        </p>

        <div style={{ marginTop: 64, textAlign: "center" }}>
          <p
            style={{
              fontSize: 34,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              fontWeight: 800,
              color: "#1B5E3C",
              maxWidth: "22ch",
              margin: "0 auto",
            }}
          >
            Barbellist doesn&apos;t cost you money. It rescues the money you are
            already losing.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

function DeepDiveSection() {
  const checklistItems = [
    "Real-time revenue vs. expenses",
    "At-risk member alerts",
    "Expiring memberships this week",
  ];

  return (
    <section
      id="deepdive"
      className="lp-section-lg"
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "100px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 110,
      }}
    >
      {/* Row A */}
      <Reveal
        variant="left"
        className="lp-grid-deep"
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr .95fr",
          gap: 64,
          alignItems: "center",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #ECE7DC",
            borderRadius: 18,
            padding: 20,
            boxShadow: "0 30px 66px -34px rgba(23,61,40,.4)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                background: "#F7F5EF",
                border: "1px solid #EEEAE0",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 11, color: "#8E8A7F" }}>Revenue</div>
              <div
                className="num"
                style={{ fontSize: 22, fontWeight: 700, color: "#1B5E3C" }}
              >
                $8,420
              </div>
            </div>
            <div
              style={{
                background: "#F7F5EF",
                border: "1px solid #EEEAE0",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 11, color: "#8E8A7F" }}>Expenses</div>
              <div
                className="num"
                style={{ fontSize: 22, fontWeight: 700, color: "#1F1F1F" }}
              >
                $3,180
              </div>
            </div>
            <div
              style={{
                background: "#173D28",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 11, color: "#9DBBAB" }}>Net profit</div>
              <div
                className="num"
                style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}
              >
                $5,240
              </div>
            </div>
          </div>
          <div
            style={{
              border: "1px solid #EEEAE0",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#54524B",
                marginBottom: 12,
              }}
            >
              Revenue vs expenses · 6 months
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 12,
                height: 130,
              }}
            >
              <ChartBars />
            </div>
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#C9861B",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Owner Dashboard
          </div>
          <h2
            style={{
              fontSize: 36,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              fontWeight: 800,
              color: "#173D28",
            }}
          >
            Your gym, in one glance.
          </h2>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              color: "#6B6862",
              marginTop: 16,
            }}
          >
            Revenue, expenses, net profit, overdue fees, at-risk members — all
            live, all in one place. No more monthly guessing games.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 24,
            }}
          >
            {checklistItems.map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 15,
                  color: "#3A3A38",
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    background: "#E7F3EC",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      width: 9,
                      height: 5,
                      borderLeft: "2px solid #1B5E3C",
                      borderBottom: "2px solid #1B5E3C",
                      transform: "rotate(-45deg)",
                      marginTop: -2,
                    }}
                  />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Row B */}
      <Reveal
        variant="right"
        className="lp-grid-deep-rev"
        style={{
          display: "grid",
          gridTemplateColumns: ".95fr 1.05fr",
          gap: 64,
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#C9861B",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Attendance &amp; Cards
          </div>
          <h2
            style={{
              fontSize: 36,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              fontWeight: 800,
              color: "#173D28",
            }}
          >
            Check-in that feels like a product, not a punishment.
          </h2>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              color: "#6B6862",
              marginTop: 16,
            }}
          >
            Every member gets an auto-generated smart card with a signed QR
            code. Tap at the kiosk. Fee status shown instantly. No lines, no
            register, no awkward conversations.
          </p>
        </div>
        <div
          style={{
            position: "relative",
            background: "#173D28",
            borderRadius: 18,
            padding: 44,
            boxShadow: "0 30px 66px -34px rgba(23,61,40,.5)",
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 26,
              width: 280,
              textAlign: "center",
              boxShadow: "0 20px 40px -18px rgba(0,0,0,.4)",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#E7F3EC",
                margin: "0 auto 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 11,
                  borderLeft: "3px solid #1B5E3C",
                  borderBottom: "3px solid #1B5E3C",
                  transform: "rotate(-45deg)",
                  marginTop: -5,
                }}
              />
            </div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#173D28",
              }}
            >
              Welcome back, Hamza
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
                background: "#E7F3EC",
                color: "#1B5E3C",
                fontSize: 12,
                fontWeight: 600,
                padding: "5px 12px",
                borderRadius: 100,
              }}
            >
              Fees paid · valid to 30 Aug
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              right: 26,
              bottom: 26,
              background: "#E7B24E",
              color: "#3A2A08",
              fontSize: 12,
              fontWeight: 700,
              padding: "8px 14px",
              borderRadius: 100,
              transform: "rotate(-4deg)",
            }}
          >
            Signed QR · tamper-proof
          </div>
        </div>
      </Reveal>

      {/* Row C */}
      <Reveal
        variant="left"
        className="lp-grid-deep"
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr .95fr",
          gap: 64,
          alignItems: "center",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #ECE7DC",
            borderRadius: 18,
            padding: 22,
            boxShadow: "0 30px 66px -34px rgba(23,61,40,.4)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#54524B",
              marginBottom: 14,
            }}
          >
            This month&apos;s outgoings
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Staff salaries", amount: "$1,850", highlight: false },
              { label: "Electricity", amount: "$640", highlight: false },
              { label: "Equipment repair", amount: "$290", highlight: false },
              { label: "Inventory restock", amount: "$400", highlight: true },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 14,
                  padding: "12px 15px",
                  background: row.highlight ? "#EBF1EC" : "#FBF9F4",
                  border: `1px solid ${row.highlight ? "#D9E5DC" : "#F0EDE4"}`,
                  borderRadius: 10,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      background: "#EDE8DD",
                    }}
                  />
                  {row.label}
                </span>
                <span
                  className="num"
                  style={{
                    fontWeight: row.highlight ? 700 : 600,
                    color: row.highlight ? "#1B5E3C" : undefined,
                  }}
                >
                  {row.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#C9861B",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Expenses · Staff · Inventory
          </div>
          <h2
            style={{
              fontSize: 36,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              fontWeight: 800,
              color: "#173D28",
            }}
          >
            Run the whole business, not just memberships.
          </h2>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              color: "#6B6862",
              marginTop: 16,
            }}
          >
            Track staff salaries, utility bills, cleaning supplies, and
            equipment repairs alongside your inventory sales. Because a gym
            isn&apos;t just members — it&apos;s a business.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

function PricingSection({ onTalkToSales }: { onTalkToSales: () => void }) {
  const earlyFeatures = [
    "All features included",
    "Automated WhatsApp reminders",
    "Smart QR membership cards",
    "Live dashboard & reports",
    "Priority onboarding support",
    "No setup fees",
    "No lock-in — cancel anytime",
  ];

  const standardFeatures = [
    "Everything in Early Access",
    "Priority support",
    "Monthly performance reports",
    "Multi-branch support",
    "Biometric integration available",
  ];

  const comparisons = [
    { name: "Barbellist", price: "$50/mo", sub: "· 200 members", highlight: true },
    { name: "Legacy US enterprise platforms", price: "$199+/mo", highlight: false },
    { name: "Modern US flat-rate platforms", price: "$159+/mo", highlight: false },
    { name: "Specialty niche platforms", price: "$198+/mo", highlight: false },
  ];

  return (
    <Reveal
      as="section"
      id="pricing"
      variant="up"
      style={{
        background: "#F1EEE6",
        borderTop: "1px solid #E7E2D6",
      }}
    >
      <div
        className="lp-section-lg"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "96px 32px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 640,
            margin: "0 auto 52px",
          }}
        >
          <h2
            className="lp-heading-lg"
            style={{
              fontSize: 40,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              fontWeight: 800,
              color: "#173D28",
            }}
          >
            Pricing that grows with your gym.
          </h2>
          <p style={{ fontSize: 18, color: "#6B6862", marginTop: 14 }}>
            Pay per member, not per feature. Everything included, from day one.
          </p>
        </div>

        <div
          className="lp-grid-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            alignItems: "stretch",
          }}
        >
          {/* Early Access */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #EAE5D9",
              borderRadius: 20,
              padding: 36,
              boxShadow: "0 20px 46px -30px rgba(23,61,40,.4)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#C9861B",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              First 3 months
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                marginTop: 14,
              }}
            >
              <span
                className="num lp-price"
                style={{ fontSize: 56, fontWeight: 700, color: "#173D28" }}
              >
                $0.10
              </span>
              <span style={{ fontSize: 14, color: "#8A877E" }}>
                / member / month
              </span>
            </div>
            <div style={{ fontSize: 14, color: "#8A877E", marginTop: 4 }}>
              For new gyms joining Barbellist
            </div>
            <div
              style={{ height: 1, background: "#EEEAE0", margin: "24px 0" }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                fontSize: 15,
                color: "#3A3A38",
              }}
            >
              {earlyFeatures.map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <CheckIcon />
                  {f}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: "#8A877E", marginTop: 20 }}>
              $9/month minimum
            </div>
            <a
              href="#top"
              style={{
                marginTop: 20,
                textAlign: "center",
                background: "#1B5E3C",
                color: "#FAF7F2",
                padding: 14,
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                boxShadow: "0 6px 16px rgba(27,94,60,.26)",
              }}
            >
              Start free
            </a>
          </div>

          {/* Standard */}
          <div
            style={{
              position: "relative",
              background: "#fff",
              border: "1.5px solid #C9861B",
              borderRadius: 20,
              padding: 36,
              boxShadow: "0 24px 54px -28px rgba(201,134,27,.5)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              className="lp-badge-popular"
              style={{
                position: "absolute",
                top: 20,
                right: -6,
                background: "#C9861B",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                padding: "6px 16px",
                borderRadius: "6px 0 0 6px",
                letterSpacing: "0.02em",
              }}
            >
              Most Popular
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1B5E3C",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              After your first 3 months
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                marginTop: 14,
              }}
            >
              <span
                className="num lp-price"
                style={{ fontSize: 56, fontWeight: 700, color: "#173D28" }}
              >
                $0.25
              </span>
              <span style={{ fontSize: 14, color: "#8A877E" }}>
                / member / month
              </span>
            </div>
            <div style={{ fontSize: 14, color: "#8A877E", marginTop: 4 }}>
              The everyday price
            </div>
            <div
              style={{ height: 1, background: "#EEEAE0", margin: "24px 0" }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                fontSize: 15,
                color: "#3A3A38",
              }}
            >
              {standardFeatures.map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <CheckIcon />
                  {f}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: "#8A877E", marginTop: 20 }}>
              $15/month minimum
            </div>
            <button
              type="button"
              onClick={onTalkToSales}
              style={{
                marginTop: 20,
                textAlign: "center",
                background: "#fff",
                color: "#1B5E3C",
                padding: 14,
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                border: "1px solid #C9861B",
                cursor: "pointer",
                fontFamily: "inherit",
                width: "100%",
              }}
            >
              Talk to sales
            </button>
          </div>
        </div>

        {/* Comparison strip */}
        <div
          style={{
            marginTop: 56,
            background: "#fff",
            border: "1px solid #EAE5D9",
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 16px 40px -30px rgba(23,61,40,.35)",
          }}
        >
          <div style={{ padding: "22px 28px", borderBottom: "1px solid #F0EDE4" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1F1F1F" }}>
              Compare that to legacy gym software.
            </div>
          </div>
          {comparisons.map((row, i) => (
            <div
              key={row.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 28px",
                background: row.highlight ? "#EBF1EC" : undefined,
                borderTop: i > 0 ? "1px solid #F3F0E8" : undefined,
              }}
            >
              <span
                style={{
                  fontWeight: row.highlight ? 700 : undefined,
                  color: row.highlight ? "#173D28" : "#8A877E",
                }}
              >
                {row.name}
              </span>
              <span
                className="num"
                style={{
                  fontWeight: row.highlight ? 700 : 600,
                  color: row.highlight ? "#1B5E3C" : "#8A877E",
                  fontSize: row.highlight ? 17 : undefined,
                }}
              >
                {row.price}{" "}
                {row.sub && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#5E7166",
                    }}
                  >
                    {row.sub}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
        <p
          style={{
            fontSize: 12,
            color: "#9A968B",
            marginTop: 14,
            textAlign: "center",
            maxWidth: "70ch",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Comparison based on publicly listed pricing pages of major gym
          software platforms in 2026, for a 200-member gym.
        </p>
        <p
          style={{
            fontSize: 13,
            color: "#6B6862",
            marginTop: 20,
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          All prices in USD. Local currency billing available.
        </p>
      </div>
    </Reveal>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "We stopped losing $400 a month in forgotten renewals within our first two weeks.",
      name: "Bilal S.",
      role: "Owner, Barbell Republic · Karachi",
    },
    {
      quote:
        "The dashboard is the first thing I check every morning. It changed how I run the business.",
      name: "Farrukh Q.",
      role: "Owner, Titan Gym · Dubai",
    },
    {
      quote:
        "Members love the cards. My wife loves that I'm home for dinner again.",
      name: "Adnan R.",
      role: "Owner, Ironclad Fitness · Lahore",
    },
  ];

  return (
    <section
      className="lp-section-lg"
      style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 32px" }}
    >
      <Reveal>
        <h2
          className="lp-heading-md"
          style={{
            fontSize: 36,
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
            fontWeight: 800,
            color: "#173D28",
            textAlign: "center",
            maxWidth: "20ch",
            margin: "0 auto 48px",
          }}
        >
          Owners who put down the paper register.
        </h2>
      </Reveal>
      <div
        className="lp-grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
        }}
      >
        {testimonials.map((t, i) => (
          <Reveal
            key={t.name}
            variant="up"
            delay={i * 120}
            style={{
              position: "relative",
              background: "#fff",
              border: "1px solid #EEE9DE",
              borderRadius: 16,
              padding: "32px 28px",
              boxShadow: "0 16px 40px -30px rgba(23,61,40,.35)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 18,
                left: 24,
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 56,
                lineHeight: 1,
                color: "#EBD8AE",
                fontWeight: 700,
              }}
            >
              &ldquo;
            </div>
            <p
              style={{
                position: "relative",
                fontSize: 17,
                lineHeight: 1.55,
                color: "#2E2E2C",
                marginTop: 30,
                fontWeight: 500,
              }}
            >
              {t.quote}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 24,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "#EDE8DD",
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#1F1F1F",
                  }}
                >
                  {t.name}
                </div>
                <div style={{ fontSize: 13, color: "#8A877E" }}>{t.role}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function FaqSection({
  openFaq,
  setOpenFaq,
}: {
  openFaq: number;
  setOpenFaq: (fn: (s: number) => number) => void;
}) {
  return (
    <section id="faq" style={{ background: "#FAF7F2" }}>
      <Reveal
        className="lp-section"
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "40px 32px 96px",
        }}
      >
        <h2
          className="lp-heading-md"
          style={{
            fontSize: 36,
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
            fontWeight: 800,
            color: "#173D28",
            textAlign: "center",
            marginBottom: 44,
          }}
        >
          Questions, answered.
        </h2>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {faqData.map((faq, i) => (
            <div key={faq.q} style={{ borderBottom: "1px solid #E8E5DF" }}>
              <button
                type="button"
                onClick={() =>
                  setOpenFaq((s) => (s === i ? -1 : i))
                }
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                  padding: "22px 4px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1F1F1F",
                  }}
                >
                  {faq.q}
                </span>
                <span
                  style={{
                    flex: "0 0 auto",
                    width: 26,
                    height: 26,
                    position: "relative",
                    color: "#1B5E3C",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: 14,
                      height: 2,
                      background: "currentColor",
                      transform: "translate(-50%, -50%)",
                      borderRadius: 2,
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: 2,
                      height: 14,
                      background: "currentColor",
                      transform: `translate(-50%, -50%) scaleY(${openFaq === i ? 0 : 1})`,
                      borderRadius: 2,
                      transition: "transform .2s",
                    }}
                  />
                </span>
              </button>
              <div
                style={{
                  maxHeight: openFaq === i ? 240 : 0,
                  overflow: "hidden",
                  transition: "max-height .3s ease",
                }}
              >
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: "#6B6862",
                    padding: "0 4px 24px",
                    maxWidth: "64ch",
                  }}
                >
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section
      style={{
        background: "linear-gradient(180deg,#EBF1EC,#E4EDE6)",
        borderTop: "1px solid #DCE6DE",
      }}
    >
      <Reveal
        variant="scale"
        className="lp-section-lg"
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "100px 32px",
          textAlign: "center",
        }}
      >
        <h2
          className="lp-heading-lg"
          style={{
            fontSize: 46,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            fontWeight: 800,
            color: "#173D28",
          }}
        >
          Your paper register won&apos;t miss you.
        </h2>
        <p style={{ fontSize: 19, color: "#4C5A50", marginTop: 18 }}>
          Start free. Onboard your gym in under an hour.
        </p>
        <a
          href="#top"
          style={{
            display: "inline-block",
            marginTop: 30,
            background: "#1B5E3C",
            color: "#FAF7F2",
            padding: "16px 32px",
            borderRadius: 12,
            fontSize: 17,
            fontWeight: 600,
            boxShadow: "0 10px 26px rgba(27,94,60,.32)",
          }}
        >
          Start free — no card required
        </a>
        <p style={{ fontSize: 14, color: "#7C8A80", marginTop: 18 }}>
          Trusted by gym owners across three continents.
        </p>
      </Reveal>
    </section>
  );
}

function FooterSection() {
  const columns = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Changelog", href: "#top" },
        { label: "Roadmap", href: "#top" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#top" },
        { label: "Blog", href: "#top" },
        { label: "Contact", href: "#top" },
        { label: "Careers", href: "#top" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Docs", href: "#faq" },
        { label: "Support", href: "#top" },
        { label: "API", href: "#top" },
        { label: "Status", href: "#top" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms", href: "#top" },
        { label: "Privacy", href: "#top" },
        { label: "Security", href: "#top" },
      ],
    },
  ];

  return (
    <footer style={{ background: "#173D28", color: "#B9CFC1" }}>
      <div
        className="lp-footer-grid"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "64px 32px 40px",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr",
          gap: 40,
        }}
      >
        <div className="lp-footer-brand">
          <div
            style={{
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: "-0.02em",
              color: "#fff",
            }}
          >
            Barbell<span style={{ color: "#E7B24E" }}>ist</span>
          </div>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.55,
              color: "#93AC9D",
              marginTop: 14,
              maxWidth: "26ch",
            }}
          >
            The calm, all-in-one gym management platform for independent gyms
            worldwide.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {["X", "IG"].map((label) => (
              <span
                key={label}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: "rgba(255,255,255,.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: label === "X" ? 13 : 12,
                  fontWeight: 600,
                  color: "#CFE0D6",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
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
                <a key={link.label} href={link.href} style={{ color: "#B9CFC1" }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,.1)" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "20px 32px",
            fontSize: 13,
            color: "#7E988A",
          }}
        >
          © 2026 Barbellist. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
