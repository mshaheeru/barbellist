/** Barbellist barbell icon — gold stroke on green mark per brand spec */
export function BarbellMark({
  size = 28,
  stroke = "#C9861B",
  className = "",
}: {
  size?: number;
  stroke?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect
        x="2"
        y="14"
        width="4"
        height="8"
        rx="1.2"
        transform="rotate(-45 4 18)"
      />
      <rect
        x="18"
        y="2"
        width="4"
        height="8"
        rx="1.2"
        transform="rotate(-45 20 6)"
      />
      <path d="M6.5 6.5l11 11" />
    </svg>
  );
}
