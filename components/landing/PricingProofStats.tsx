"use client";

import { useCurrency } from "./CurrencyProvider";
import { useCountUp, useInViewOnce } from "./landing-motion";

export function PricingProofStats() {
  const { demo } = useCurrency();
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.3);
  const recovered = useCountUp(18420, inView, 1800);
  const overdue = useCountUp(47, inView, 1400);
  const seconds = useCountUp(3, inView, 1000);

  const stats = [
    { value: demo(recovered), label: "Revenue recovered" },
    { value: String(overdue), label: "Overdue members caught" },
    { value: `${seconds} seconds`, label: "Time to send a reminder" },
  ];

  return (
    <div
      ref={ref}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 20,
        marginBottom: 48,
        textAlign: "center",
      }}
      className="lp-proof-stats"
    >
      {stats.map((s) => (
        <div key={s.label}>
          <div
            className="num"
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#1B5E3C",
              letterSpacing: "-0.02em",
            }}
          >
            {s.value}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#8A877E",
              marginTop: 6,
              fontWeight: 500,
            }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
