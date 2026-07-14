"use client";

import { FormEvent, useEffect, useState, type CSSProperties } from "react";

type OrderModalProps = {
  open: boolean;
  onClose: () => void;
};

const initialForm = {
  name: "",
  email: "",
  phone: "",
  gymName: "",
  city: "",
  message: "",
};

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "13px 15px",
  borderRadius: 10,
  border: "1px solid #E7E2D6",
  background: "#fff",
  fontSize: 15,
  color: "#1F1F1F",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color .18s, box-shadow .18s",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#3A3A38",
  marginBottom: 7,
};

export function OrderModal({ open, onClose }: OrderModalProps) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "submitting") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, status]);

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setStatus("idle");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const update = (key: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Order Barbellist"
      onClick={status === "submitting" ? undefined : onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(23, 61, 40, 0.55)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        padding: 24,
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 520,
          margin: "auto",
          background: "#FAF7F2",
          borderRadius: 20,
          border: "1px solid #E7E2D6",
          boxShadow:
            "0 32px 80px -24px rgba(23,61,40,.45), 0 0 0 1px rgba(255,255,255,.6) inset",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #173D28 0%, #1B5E3C 100%)",
            padding: "28px 32px 24px",
            color: "#EBF3ED",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={status === "submitting"}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,.12)",
              color: "#fff",
              fontSize: 20,
              lineHeight: 1,
              cursor: status === "submitting" ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#E7B24E",
              marginBottom: 10,
            }}
          >
            Get started
          </div>
          <h2
            style={{
              fontSize: 28,
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#fff",
              maxWidth: "18ch",
            }}
          >
            Order Barbellist for your gym
          </h2>
          <p style={{ fontSize: 15, color: "#B9CFC1", marginTop: 10, lineHeight: 1.5 }}>
            Share your details and we&apos;ll reach out to get you onboarded.
          </p>
        </div>

        {status === "success" ? (
          <div style={{ padding: "40px 32px 36px", textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#E7F3EC",
                margin: "0 auto 18px",
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
            <h3
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#173D28",
                letterSpacing: "-0.02em",
              }}
            >
              Request received
            </h3>
            <p
              style={{
                fontSize: 15,
                color: "#6B6862",
                marginTop: 10,
                lineHeight: 1.55,
                maxWidth: "32ch",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Thanks for your interest. Our team will contact you shortly to
              complete your setup.
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: 28,
                background: "#1B5E3C",
                color: "#FAF7F2",
                border: "none",
                padding: "13px 28px",
                borderRadius: 11,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 6px 16px rgba(27,94,60,.26)",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: "28px 32px 32px" }}>
            <div style={{ display: "grid", gap: 18 }}>
              <div>
                <label htmlFor="order-name" style={labelStyle}>
                  Full name <span style={{ color: "#B4451F" }}>*</span>
                </label>
                <input
                  id="order-name"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Bilal Sheikh"
                  style={fieldStyle}
                />
              </div>

              <div
                className="lp-modal-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label htmlFor="order-email" style={labelStyle}>
                    Email <span style={{ color: "#B4451F" }}>*</span>
                  </label>
                  <input
                    id="order-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@gym.com"
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label htmlFor="order-phone" style={labelStyle}>
                    Phone <span style={{ color: "#B4451F" }}>*</span>
                  </label>
                  <input
                    id="order-phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+92 300 1234567"
                    style={fieldStyle}
                  />
                </div>
              </div>

              <div
                className="lp-modal-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label htmlFor="order-gym" style={labelStyle}>
                    Gym name
                  </label>
                  <input
                    id="order-gym"
                    value={form.gymName}
                    onChange={(e) => update("gymName", e.target.value)}
                    placeholder="Iron Republic"
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label htmlFor="order-city" style={labelStyle}>
                    City
                  </label>
                  <input
                    id="order-city"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Karachi"
                    style={fieldStyle}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="order-message" style={labelStyle}>
                  Anything else?
                </label>
                <textarea
                  id="order-message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Member count, questions, preferred start date…"
                  style={{
                    ...fieldStyle,
                    resize: "vertical",
                    minHeight: 88,
                  }}
                />
              </div>
            </div>

            {status === "error" && error && (
              <p
                style={{
                  marginTop: 16,
                  fontSize: 14,
                  color: "#B4451F",
                  background: "#FBEBE4",
                  padding: "10px 14px",
                  borderRadius: 8,
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              style={{
                width: "100%",
                marginTop: 22,
                background: status === "submitting" ? "#4A7A5E" : "#1B5E3C",
                color: "#FAF7F2",
                border: "none",
                padding: "14px 24px",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                cursor: status === "submitting" ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                boxShadow: "0 6px 18px rgba(27,94,60,.28)",
                transition: "background .18s",
              }}
            >
              {status === "submitting" ? "Sending…" : "Submit order request"}
            </button>

            <p
              style={{
                fontSize: 12,
                color: "#9A968B",
                textAlign: "center",
                marginTop: 14,
                lineHeight: 1.5,
              }}
            >
              Free for your first 3 months · No setup fees · Cancel anytime
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
