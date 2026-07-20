import Link from "next/link";
import { BarbellMark } from "@/components/auth/barbell-mark";
import styles from "./barbellist-logo.module.css";

type BarbellistLogoProps = {
  /** horizontal = mark + wordmark inline; stacked = mark above wordmark */
  layout?: "horizontal" | "stacked";
  /** light = white text on dark bg; dark = green text on light bg */
  variant?: "light" | "dark";
  markSize?: number;
  wordmarkSize?: number;
  gap?: number;
  href?: string;
  className?: string;
};

export function BarbellistLogo({
  layout = "horizontal",
  variant = "dark",
  markSize = 38,
  wordmarkSize = 28,
  gap,
  href = "/home",
  className = "",
}: BarbellistLogoProps) {
  const textColor = variant === "light" ? "#FFFFFF" : "#1B5E3C";
  const markBox = Math.round(markSize * 1.05);
  const stackGap = gap ?? (layout === "stacked" ? 20 : 12);

  const mark = (
    <span
      className={styles.mark}
      style={{ width: markBox, height: markBox }}
    >
      <BarbellMark size={Math.round(markSize * 0.55)} stroke="#C9861B" />
    </span>
  );

  const wordmark = (
    <span
      className={`auth-display-title ${styles.wordmark}`}
      style={{ fontSize: wordmarkSize, color: textColor, lineHeight: 1.1 }}
    >
      Barbell
      <span className={styles.istWrap}>
        ist
        <span className={styles.underline} />
      </span>
    </span>
  );

  const inner =
    layout === "stacked" ? (
      <span
        className={`${styles.stack} ${className}`}
        style={{ gap: stackGap }}
      >
        {mark}
        {wordmark}
      </span>
    ) : (
      <span className={`${styles.row} ${className}`} style={{ gap: stackGap }}>
        {mark}
        {wordmark}
      </span>
    );

  if (href) {
    return (
      <Link href={href} className={styles.link}>
        {inner}
      </Link>
    );
  }

  return inner;
}
