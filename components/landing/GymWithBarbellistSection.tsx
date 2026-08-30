"use client";

import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";
import { useInViewOnce } from "./landing-motion";

type ScenarioId = "payments" | "members" | "renewals" | "day";

const TABS: { id: ScenarioId; label: string }[] = [
  { id: "payments", label: "Payments" },
  { id: "members", label: "Members" },
  { id: "renewals", label: "Renewals" },
  { id: "day", label: "Your day" },
];

/** Phase within one scenario cycle: problem → detect → act → resolved */
type Phase = 0 | 1 | 2 | 3;

const CYCLE_MS = 2800;
const PHASE_MS = 700;

export function GymWithBarbellistSection() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.25);
  const [active, setActive] = useState<ScenarioId>("payments");
  const [phase, setPhase] = useState<Phase>(0);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Auto-cycle scenarios when in view (desktop demo)
  useEffect(() => {
    if (!inView || reduced || paused) return;

    setPhase(0);
    const phaseTimers: number[] = [];
    phaseTimers.push(window.setTimeout(() => setPhase(1), PHASE_MS));
    phaseTimers.push(window.setTimeout(() => setPhase(2), PHASE_MS * 2));
    phaseTimers.push(window.setTimeout(() => setPhase(3), PHASE_MS * 3));

    const advance = window.setTimeout(() => {
      setActive((prev) => {
        const i = TABS.findIndex((t) => t.id === prev);
        return TABS[(i + 1) % TABS.length].id;
      });
      setPhase(0);
    }, CYCLE_MS);

    return () => {
      phaseTimers.forEach(clearTimeout);
      clearTimeout(advance);
    };
  }, [active, inView, reduced, paused]);

  // When reduced motion: show resolved state
  useEffect(() => {
    if (reduced) setPhase(3);
  }, [reduced, active]);

  const selectTab = (id: ScenarioId) => {
    setActive(id);
    setPhase(reduced ? 3 : 0);
  };

  return (
    <Reveal
      as="section"
      id="with-barbellist"
      aria-label="Your gym with Barbellist"
      className="lp-section"
    >
      <span className="lp-section-label">Your gym with Barbellist</span>
      <h2
        className="lp-heading-lg"
        style={{
          textAlign: "center",
          fontSize: "clamp(32px, 4.5vw, 52px)",
          lineHeight: 1.08,
          maxWidth: 640,
          margin: "0 auto",
        }}
      >
        Your gym stops relying on memory.
      </h2>
      <p
        style={{
          textAlign: "center",
          fontSize: 18,
          color: "var(--lp-text-muted)",
          maxWidth: 480,
          margin: "16px auto 0",
          lineHeight: 1.6,
        }}
      >
        Barbellist keeps an eye on the things that normally get missed, so you
        don&apos;t have to.
      </p>

      {/* Desktop visual story */}
      <div
        ref={ref}
        className="lp-gym-panel lp-gym-desktop"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setPaused(false);
          }
        }}
      >
        <div className="lp-gym-nav" role="tablist" aria-label="Scenarios">
          {TABS.map((tab) => {
            const selected = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`gym-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`gym-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                className={`lp-gym-tab${selected ? " is-active" : ""}`}
                onClick={() => selectTab(tab.id)}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
                  e.preventDefault();
                  const i = TABS.findIndex((t) => t.id === active);
                  const next =
                    e.key === "ArrowDown"
                      ? TABS[(i + 1) % TABS.length]
                      : TABS[(i - 1 + TABS.length) % TABS.length];
                  selectTab(next.id);
                  document.getElementById(`gym-tab-${next.id}`)?.focus();
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          className="lp-gym-stage"
          role="tabpanel"
          id={`gym-panel-${active}`}
          aria-labelledby={`gym-tab-${active}`}
        >
          <ScenarioStage id={active} phase={phase} />
        </div>
      </div>

      {/* Mobile: stacked mini demos */}
      <div className="lp-gym-mobile">
        {TABS.map((tab) => (
          <div key={tab.id} className="lp-gym-mobile-block">
            <div className="lp-gym-mobile-label">{tab.label}</div>
            <MobileScenario id={tab.id} />
          </div>
        ))}
      </div>

      <p className="lp-gym-micro">
        Your gym. Your members. Barbellist keeps track.
      </p>

      <div className="lp-gym-close">
        <h3
          className="lp-heading-md"
          style={{
            fontSize: "clamp(24px, 3vw, 32px)",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          You don&apos;t have to remember everything anymore.
        </h3>
        <p
          style={{
            textAlign: "center",
            fontSize: 16,
            color: "var(--lp-text-muted)",
            maxWidth: 420,
            margin: "0 auto 24px",
            lineHeight: 1.6,
          }}
        >
          Barbellist watches the gym in the background and shows you what needs
          your attention.
        </p>
        <a href="#how-it-works" className="lp-gym-cta">
          See how Barbellist works →
        </a>
      </div>
    </Reveal>
  );
}

function ScenarioStage({ id, phase }: { id: ScenarioId; phase: Phase }) {
  switch (id) {
    case "payments":
      return <PaymentScene phase={phase} />;
    case "members":
      return <MemberScene phase={phase} />;
    case "renewals":
      return <RenewalScene phase={phase} />;
    case "day":
      return <DayScene phase={phase} />;
  }
}

function SceneCopy({
  before,
  after,
  phase,
}: {
  before: [string, string?];
  after: [string, string];
  phase: Phase;
}) {
  const showAfter = phase >= 2;
  return (
    <div className="lp-gym-copy">
      <div className={`lp-gym-copy-block${showAfter ? " is-dim" : ""}`}>
        <span className="lp-gym-eyebrow-muted">Before</span>
        <p>{before[0]}</p>
        {before[1] ? <p>{before[1]}</p> : null}
      </div>
      <div className={`lp-gym-copy-block${showAfter ? " is-on" : ""}`}>
        <span className="lp-gym-eyebrow-amber">With Barbellist</span>
        <p>{after[0]}</p>
        <p>{after[1]}</p>
      </div>
    </div>
  );
}

function MemberChip({
  name,
  detail,
  status,
  resolved,
  scanning,
  attention,
}: {
  name: string;
  detail: string;
  status: string;
  resolved?: boolean;
  scanning?: boolean;
  attention?: boolean;
}) {
  const statusClass = resolved
    ? "is-ok"
    : attention
      ? "is-attention"
      : "is-warn";
  return (
    <div
      className={`lp-gym-chip${resolved ? " is-resolved" : ""}${scanning ? " is-scanning" : ""}${attention ? " is-attention-chip" : ""}`}
    >
      <div className="lp-gym-chip-avatar" aria-hidden>
        {name.charAt(0)}
      </div>
      <div className="lp-gym-chip-body">
        <div className="lp-gym-chip-name">{name}</div>
        <div className="lp-gym-chip-detail">{detail}</div>
      </div>
      <div className={`lp-gym-chip-status ${statusClass}`}>
        {resolved ? (
          <>
            <span className="lp-gym-check" aria-hidden>
              ✓
            </span>{" "}
            {status}
          </>
        ) : (
          <>
            <span className="lp-gym-dot" aria-hidden />
            {status}
          </>
        )}
      </div>
    </div>
  );
}

function PaymentScene({ phase }: { phase: Phase }) {
  const scanning = phase === 1;
  const resolved = phase >= 3;
  const acting = phase >= 2;
  return (
    <div className="lp-gym-scene">
      <SceneCopy
        phase={phase}
        before={["Fee is overdue.", "Someone has to remember."]}
        after={["Overdue spotted.", "Reminder sent."]}
      />
      <div className="lp-gym-visual">
        <MemberChip
          name="Adnan"
          detail="Fee overdue · 7 days"
          status={
            resolved || acting ? "Reminder sent" : scanning ? "Spotted" : "Overdue"
          }
          scanning={scanning}
          resolved={resolved || acting}
        />
        {(acting || resolved) && (
          <div className="lp-gym-toast" role="status">
            WhatsApp reminder sent ✓
          </div>
        )}
      </div>
    </div>
  );
}

function MemberScene({ phase }: { phase: Phase }) {
  const scanning = phase === 1;
  const resolved = phase >= 2;
  return (
    <div className="lp-gym-scene">
      <SceneCopy
        phase={phase}
        before={["Member stops coming.", "Nobody notices."]}
        after={["Member goes quiet.", "Barbellist flags it."]}
      />
      <div className="lp-gym-visual">
        <MemberChip
          name="Usman"
          detail="Last visit: 12 days ago"
          status={resolved ? "Needs attention" : scanning ? "Quiet" : "Active?"}
          scanning={scanning}
          attention={resolved}
        />
        {resolved && (
          <div className="lp-gym-flag" role="status">
            Flagged for follow-up
          </div>
        )}
      </div>
    </div>
  );
}

function RenewalScene({ phase }: { phase: Phase }) {
  const scanning = phase === 1;
  const resolved = phase >= 2;
  return (
    <div className="lp-gym-scene">
      <SceneCopy
        phase={phase}
        before={["Membership expires.", "You find out late."]}
        after={["Expiry coming up.", "Member gets reminded."]}
      />
      <div className="lp-gym-visual">
        <MemberChip
          name="Sana"
          detail="Expires in 3 days"
          status={
            resolved ? "Reminder scheduled" : scanning ? "Coming up" : "Expires soon"
          }
          scanning={scanning}
          resolved={resolved}
        />
        {resolved && (
          <div className="lp-gym-toast" role="status">
            Reminder scheduled ✓
          </div>
        )}
      </div>
    </div>
  );
}

function DayScene({ phase }: { phase: Phase }) {
  const lit = phase >= 1;
  return (
    <div className="lp-gym-scene">
      <SceneCopy
        phase={phase}
        before={["You keep checking everything yourself."]}
        after={["You open one screen.", "You know what needs attention."]}
      />
      <div className="lp-gym-visual">
        <div className={`lp-gym-day${lit ? " is-lit" : ""}`}>
          <div className="lp-gym-day-title">Today</div>
          <ul className="lp-gym-day-list">
            <li>
              <span className="lp-gym-day-n">3</span> payments need attention
            </li>
            <li>
              <span className="lp-gym-day-n">2</span> memberships expiring
            </li>
            <li>
              <span className="lp-gym-day-n">4</span> members haven&apos;t visited
            </li>
          </ul>
          <p className="lp-gym-day-note">Everything else is handled.</p>
        </div>
      </div>
    </div>
  );
}

/** Static before → after for mobile (no auto-cycle needed) */
function MobileScenario({ id }: { id: ScenarioId }) {
  if (id === "payments") {
    return (
      <div className="lp-gym-mobile-flow">
        <p className="lp-gym-mobile-line">Fee is overdue.</p>
        <p className="lp-gym-mobile-line muted">Someone has to remember.</p>
        <MemberChip name="Adnan" detail="Fee overdue · 7 days" status="Overdue" />
        <div className="lp-gym-arrow" aria-hidden>
          ↓
        </div>
        <p className="lp-gym-mobile-line">Barbellist spots it.</p>
        <p className="lp-gym-mobile-line amber">Reminder sent ✓</p>
        <MemberChip
          name="Adnan"
          detail="Fee overdue · 7 days"
          status="Reminder sent"
          resolved
        />
      </div>
    );
  }
  if (id === "members") {
    return (
      <div className="lp-gym-mobile-flow">
        <p className="lp-gym-mobile-line">Member stops coming.</p>
        <p className="lp-gym-mobile-line muted">Nobody notices.</p>
        <MemberChip
          name="Usman"
          detail="Last visit: 12 days ago"
          status="Active?"
        />
        <div className="lp-gym-arrow" aria-hidden>
          ↓
        </div>
        <p className="lp-gym-mobile-line">Member goes quiet.</p>
        <p className="lp-gym-mobile-line amber">Barbellist flags it.</p>
        <MemberChip
          name="Usman"
          detail="Last visit: 12 days ago"
          status="Needs attention"
          attention
        />
      </div>
    );
  }
  if (id === "renewals") {
    return (
      <div className="lp-gym-mobile-flow">
        <p className="lp-gym-mobile-line">Membership expires.</p>
        <p className="lp-gym-mobile-line muted">You find out late.</p>
        <MemberChip name="Sana" detail="Expires in 3 days" status="Expires soon" />
        <div className="lp-gym-arrow" aria-hidden>
          ↓
        </div>
        <p className="lp-gym-mobile-line">Expiry coming up.</p>
        <p className="lp-gym-mobile-line amber">Reminder scheduled ✓</p>
        <MemberChip
          name="Sana"
          detail="Expires in 3 days"
          status="Reminder scheduled"
          resolved
        />
      </div>
    );
  }
  return (
    <div className="lp-gym-mobile-flow">
      <p className="lp-gym-mobile-line">You keep checking everything yourself.</p>
      <div className="lp-gym-arrow" aria-hidden>
        ↓
      </div>
      <p className="lp-gym-mobile-line">You open one screen.</p>
      <p className="lp-gym-mobile-line muted">You know what needs attention.</p>
      <div className="lp-gym-day is-lit">
        <div className="lp-gym-day-title">Today</div>
        <ul className="lp-gym-day-list">
          <li>
            <span className="lp-gym-day-n">3</span> payments need attention
          </li>
          <li>
            <span className="lp-gym-day-n">2</span> memberships expiring
          </li>
          <li>
            <span className="lp-gym-day-n">4</span> members haven&apos;t visited
          </li>
        </ul>
        <p className="lp-gym-day-note">Everything else is handled.</p>
      </div>
    </div>
  );
}
