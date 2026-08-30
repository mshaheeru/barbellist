"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type AuditModalProps = {
  open: boolean;
  onClose: () => void;
};

const ATTENDANCE_OPTIONS = [
  { value: "paper_register", label: "Paper register" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "spreadsheet", label: "Spreadsheet" },
  { value: "other_software", label: "Other software" },
  { value: "nothing", label: "We don't track it" },
  { value: "other", label: "Other" },
] as const;

const initialForm = {
  contactName: "",
  email: "",
  phone: "",
  gymName: "",
  activeMembers: "",
  averageMonthlyFee: "",
  currentlyOverdue: "",
  expireNext30Days: "",
  attendanceTracking: "paper_register" as (typeof ATTENDANCE_OPTIONS)[number]["value"],
};

function estimateRange(form: typeof initialForm) {
  const fee = Number(form.averageMonthlyFee) || 0;
  const overdue = Number(form.currentlyOverdue) || 0;
  const expiry = Number(form.expireNext30Days) || 0;
  if (fee <= 0) return null;
  const low = Math.round(overdue * fee + expiry * fee * 0.35);
  const high = Math.round(overdue * fee + expiry * fee * 0.7);
  if (low <= 0 && high <= 0) return null;
  return { low, high };
}

function formatRs(n: number) {
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid var(--lp-border)",
  background: "#0a0a0a",
  fontSize: 15,
  color: "var(--lp-text-primary)",
  fontFamily: "inherit",
  outline: "none",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--lp-text-muted)",
  marginBottom: 7,
};

export function RevenueAuditModal({ open, onClose }: AuditModalProps) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [savedEstimate, setSavedEstimate] = useState<{
    low: number;
    high: number;
  } | null>(null);

  const liveEstimate = useMemo(() => estimateRange(form), [form]);

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
      setSavedEstimate(null);
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
      const res = await fetch("/api/revenue-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: form.contactName,
          email: form.email,
          phone: form.phone,
          gymName: form.gymName || null,
          activeMembers: Number(form.activeMembers),
          averageMonthlyFee: Number(form.averageMonthlyFee),
          currentlyOverdue: Number(form.currentlyOverdue),
          expireNext30Days: Number(form.expireNext30Days),
          attendanceTracking: form.attendanceTracking,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(json.error || "Something went wrong.");
        return;
      }
      setSavedEstimate({
        low: json.data.estimatedAtRiskLow,
        high: json.data.estimatedAtRiskHigh,
      });
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Could not send. Please try again.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== "submitting") onClose();
      }}
    >
      <div
        className="lp-audit-modal"
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--lp-bg-card)",
          border: "1px solid var(--lp-border)",
          borderRadius: 20,
          padding: "28px 24px 24px",
          boxShadow: "0 0 60px rgba(201,134,27,0.08)",
        }}
      >
        {status === "success" && savedEstimate ? (
          <div style={{ textAlign: "center", padding: "12px 8px" }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--lp-accent)",
                marginBottom: 12,
              }}
            >
              Rough estimate
            </div>
            <h2
              id="audit-modal-title"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 800,
                color: "var(--lp-text-primary)",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                marginBottom: 12,
              }}
            >
              Estimated monthly revenue at risk
            </h2>
            <p
              className="num"
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "var(--lp-accent)",
                marginBottom: 16,
              }}
            >
              {formatRs(savedEstimate.low)} – {formatRs(savedEstimate.high)}
            </p>
            <p
              style={{
                fontSize: 15,
                color: "var(--lp-text-muted)",
                lineHeight: 1.55,
                marginBottom: 28,
              }}
            >
              This is a rough range from the numbers you shared. We saved your
              answers and will follow up to help you get a clearer picture.
            </p>
            <button
              type="button"
              className="lp-btn-primary"
              onClick={onClose}
              style={{ width: "100%" }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--lp-accent)",
                    marginBottom: 8,
                  }}
                >
                  Free revenue audit
                </div>
                <h2
                  id="audit-modal-title"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 24,
                    fontWeight: 800,
                    color: "var(--lp-text-primary)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.15,
                  }}
                >
                  How much is your gym leaving on the table?
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                disabled={status === "submitting"}
                style={{
                  background: "var(--lp-white-5)",
                  border: "1px solid var(--lp-white-10)",
                  borderRadius: 8,
                  width: 36,
                  height: 36,
                  color: "var(--lp-text-muted)",
                  cursor: "pointer",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--lp-text-muted)",
                lineHeight: 1.5,
                marginBottom: 24,
              }}
            >
              Answer a few questions. We&apos;ll give you a rough estimate and
              reach out if you want help.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="lp-audit-grid">
                <Field label="Your name" htmlFor="audit-name">
                  <input
                    id="audit-name"
                    required
                    value={form.contactName}
                    onChange={(e) => update("contactName", e.target.value)}
                    style={fieldStyle}
                    autoComplete="name"
                  />
                </Field>
                <Field label="Gym name" htmlFor="audit-gym">
                  <input
                    id="audit-gym"
                    value={form.gymName}
                    onChange={(e) => update("gymName", e.target.value)}
                    style={fieldStyle}
                    placeholder="Optional"
                  />
                </Field>
                <Field label="Email" htmlFor="audit-email">
                  <input
                    id="audit-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    style={fieldStyle}
                    autoComplete="email"
                  />
                </Field>
                <Field label="Phone / WhatsApp" htmlFor="audit-phone">
                  <input
                    id="audit-phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    style={fieldStyle}
                    autoComplete="tel"
                  />
                </Field>
                <Field
                  label="How many active members?"
                  htmlFor="audit-members"
                >
                  <input
                    id="audit-members"
                    type="number"
                    min={0}
                    required
                    value={form.activeMembers}
                    onChange={(e) => update("activeMembers", e.target.value)}
                    style={fieldStyle}
                  />
                </Field>
                <Field
                  label="Average monthly fee (Rs.)"
                  htmlFor="audit-fee"
                >
                  <input
                    id="audit-fee"
                    type="number"
                    min={0}
                    required
                    value={form.averageMonthlyFee}
                    onChange={(e) =>
                      update("averageMonthlyFee", e.target.value)
                    }
                    style={fieldStyle}
                  />
                </Field>
                <Field
                  label="How many currently overdue?"
                  htmlFor="audit-overdue"
                >
                  <input
                    id="audit-overdue"
                    type="number"
                    min={0}
                    required
                    value={form.currentlyOverdue}
                    onChange={(e) => update("currentlyOverdue", e.target.value)}
                    style={fieldStyle}
                  />
                </Field>
                <Field
                  label="How many expire in the next 30 days?"
                  htmlFor="audit-expire"
                >
                  <input
                    id="audit-expire"
                    type="number"
                    min={0}
                    required
                    value={form.expireNext30Days}
                    onChange={(e) =>
                      update("expireNext30Days", e.target.value)
                    }
                    style={fieldStyle}
                  />
                </Field>
              </div>

              <div style={{ marginTop: 16 }}>
                <label htmlFor="audit-attendance" style={labelStyle}>
                  How do you currently track attendance?
                </label>
                <select
                  id="audit-attendance"
                  required
                  value={form.attendanceTracking}
                  onChange={(e) =>
                    update(
                      "attendanceTracking",
                      e.target.value as typeof form.attendanceTracking,
                    )
                  }
                  style={{ ...fieldStyle, cursor: "pointer" }}
                >
                  {ATTENDANCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {liveEstimate && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 14,
                    borderRadius: 12,
                    background: "var(--lp-accent-glow)",
                    border: "1px solid rgba(201,134,27,0.25)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--lp-text-muted)",
                      marginBottom: 4,
                    }}
                  >
                    Estimated monthly revenue at risk
                  </div>
                  <div
                    className="num"
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "var(--lp-accent)",
                    }}
                  >
                    {formatRs(liveEstimate.low)} – {formatRs(liveEstimate.high)}
                  </div>
                </div>
              )}

              {error && (
                <p
                  style={{
                    color: "#f87171",
                    fontSize: 14,
                    marginTop: 14,
                  }}
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="lp-btn-primary"
                disabled={status === "submitting"}
                style={{ width: "100%", marginTop: 20 }}
              >
                {status === "submitting"
                  ? "Saving…"
                  : "Get my free estimate →"}
              </button>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--lp-text-muted)",
                  textAlign: "center",
                  marginTop: 12,
                }}
              >
                We only use this to follow up about your audit.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} style={labelStyle}>
        {label}
      </label>
      {children}
    </div>
  );
}
