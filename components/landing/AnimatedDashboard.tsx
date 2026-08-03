"use client";

import { ChartBars } from "./landing-helpers";
import { useCurrency } from "./CurrencyProvider";
import { useCountUp, useInViewOnce } from "./landing-motion";

const AT_RISK = [
  { name: "Adnan R.", badge: "7d overdue", color: "#B4451F", bg: "#FBEBE4" },
  { name: "Sana K.", badge: "3d overdue", color: "#B4451F", bg: "#FBEBE4" },
  { name: "Usman T.", badge: "expires 2d", color: "#9A6A12", bg: "#F7EBD3" },
];

export function AnimatedDashboard() {
  const { demo } = useCurrency();
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.2);
  const revenue = useCountUp(8420, inView, 1600);
  const expenses = useCountUp(3180, inView, 1600);
  const net = useCountUp(5240, inView, 1800);

  return (
    <div
      ref={ref}
      className={`lp-dashboard lp-dash-glow${inView ? " is-alive" : ""}`}
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
            boxShadow:
              "0 40px 80px -28px rgba(23,61,40,.4), 0 0 0 1px rgba(27,94,60,.06), 0 0 60px -12px rgba(27,94,60,.28)",
            border: "1px solid #ECE7DC",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse at 70% 30%, rgba(27,94,60,.08), transparent 55%)",
              zIndex: 1,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 16px",
              borderBottom: "1px solid #F0EDE4",
              background: "#FBF9F4",
              position: "relative",
              zIndex: 2,
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
            <span style={{ marginLeft: 14, fontSize: 12, color: "#A29E93" }}>
              app.barbellist.com/dashboard
            </span>
          </div>
          <div
            style={{
              display: "flex",
              minHeight: 400,
              position: "relative",
              zIndex: 2,
            }}
          >
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
                className="lp-dash-kpi-block"
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
                  className="lp-dash-kpi"
                  style={{
                    background: "#F7F5EF",
                    border: "1px solid #EEEAE0",
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#8E8A7F" }}>Revenue</div>
                  <div
                    className="num"
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#1B5E3C",
                      marginTop: 4,
                    }}
                  >
                    {demo(revenue)}
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
                  className="lp-dash-kpi"
                  style={{
                    background: "#F7F5EF",
                    border: "1px solid #EEEAE0",
                    borderRadius: 12,
                    padding: 14,
                    transitionDelay: "80ms",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#8E8A7F" }}>Expenses</div>
                  <div
                    className="num"
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#1F1F1F",
                      marginTop: 4,
                    }}
                  >
                    {demo(expenses)}
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
                  className="lp-dash-kpi"
                  style={{
                    background: "#173D28",
                    borderRadius: 12,
                    padding: 14,
                    transitionDelay: "160ms",
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
                    {demo(net)}
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
                  className="lp-dash-chart"
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
                    {AT_RISK.map((row, i) => (
                      <div
                        key={row.name}
                        className="lp-dash-row"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transitionDelay: `${280 + i * 140}ms`,
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
                          <div style={{ fontSize: 12 }}>{row.name}</div>
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: row.color,
                            fontWeight: 600,
                            background: row.bg,
                            padding: "2px 8px",
                            borderRadius: 100,
                          }}
                        >
                          {row.badge}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp reminder cue — types/fades in last */}
          <div
            className="lp-dash-wa"
            style={{
              position: "absolute",
              right: 18,
              bottom: 18,
              zIndex: 3,
              maxWidth: 260,
              background: "#E7F3EC",
              border: "1px solid #D6E7DC",
              borderRadius: "14px 14px 4px 14px",
              padding: "10px 13px",
              boxShadow: "0 12px 28px -14px rgba(23,61,40,.45)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#1B5E3C",
                marginBottom: 2,
              }}
            >
              WhatsApp · sending…
            </div>
            <div style={{ fontSize: 12, color: "#324237", lineHeight: 1.4 }}>
              Hi Usman, your fee is 7 days overdue. Tap to pay →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
