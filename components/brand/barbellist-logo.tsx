import Link from "next/link";
import { BarbellMark } from "@/components/auth/barbell-mark";

type BarbellistLogoProps = {
  /** horizontal = mark + wordmark inline; stacked = mark above wordmark */
  layout?: "horizontal" | "stacked";
  /** light = white text on dark bg; dark = green text on light bg */
  variant?: "light" | "dark";
  markSize?: number;
  wordmarkSize?: number;
  href?: string;
  className?: string;
};

export function BarbellistLogo({
  layout = "horizontal",
  variant = "dark",
  markSize = 38,
  wordmarkSize = 28,
  href = "/home",
  className = "",
}: BarbellistLogoProps) {
  const textColor = variant === "light" ? "#FFFFFF" : "#1B5E3C";
  const markBox = Math.round(markSize * 1.05);

  const mark = (
    <span
      className="flex shrink-0 items-center justify-center rounded-[14px] bg-[#1B5E3C] shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
      style={{ width: markBox, height: markBox }}
    >
      <BarbellMark size={Math.round(markSize * 0.55)} stroke="#C9861B" />
    </span>
  );

  const wordmark = (
    <span
      className="auth-display-title font-extrabold tracking-[-0.02em]"
      style={{ fontSize: wordmarkSize, color: textColor, lineHeight: 1.1 }}
    >
      Barbell
      <span className="relative inline-block pb-1.5">
        ist
        <span
          className="absolute bottom-0 left-0 right-0 h-[4px] rounded-sm"
          style={{
            background: "linear-gradient(90deg, #C9861B, #E7B24E)",
            boxShadow: "0 1px 4px rgba(201,134,27,0.45)",
          }}
        />
      </span>
    </span>
  );

  const inner =
    layout === "stacked" ? (
      <span
        className={`inline-flex flex-col items-center gap-5 ${className}`}
      >
        {mark}
        {wordmark}
      </span>
    ) : (
      <span
        className={`inline-flex items-center gap-3 ${className}`}
      >
        {mark}
        {wordmark}
      </span>
    );

  if (href) {
    return (
      <Link href={href} className="no-underline">
        {inner}
      </Link>
    );
  }

  return inner;
}
