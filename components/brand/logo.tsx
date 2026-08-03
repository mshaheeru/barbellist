import Link from "next/link";
import styles from "./logo.module.css";

export type LogoVariant = "wordmark" | "icon" | "lockup" | "reversed";

export type LogoProps = {
  variant: LogoVariant;
  /** Rendered height in px. Width scales with variant. */
  height?: number;
  className?: string;
  /** When set, wraps logo in a link (default null = no link). */
  href?: string | null;
  /** Accessible label; defaults to "Barbellist". */
  title?: string;
};

const GREEN = "#1B5E3C";
const AMBER = "#C9861B";
const CREAM = "#FAF7F2";
const WHITE = "#FFFFFF";
const BORDER = "#E9E2D6";

/**
 * Barbellist logo — LL uprights crossed by an amber barbell.
 * Variants follow docs/logo.dc.html.
 */
export function Logo({
  variant,
  height = 32,
  className = "",
  href = null,
  title = "Barbellist",
}: LogoProps) {
  const node =
    variant === "icon" ? (
      <IconMark height={height} className={className} title={title} />
    ) : variant === "lockup" ? (
      <Lockup height={height} className={className} title={title} inverted={false} />
    ) : variant === "reversed" ? (
      <Wordmark height={height} className={className} title={title} inverted />
    ) : (
      <Wordmark height={height} className={className} title={title} inverted={false} />
    );

  if (href) {
    return (
      <Link
        href={href}
        className={styles.link}
        aria-label={title}
        style={{ display: "inline-flex", lineHeight: 0 }}
      >
        {node}
      </Link>
    );
  }

  return node;
}

/** Compact lockup with white/cream wordmark for dark sidebars. */
export function LogoLockupReversed({
  height = 28,
  className = "",
  href = "/dashboard",
  title = "Barbellist",
}: Omit<LogoProps, "variant">) {
  const node = (
    <Lockup height={height} className={className} title={title} inverted />
  );
  if (href) {
    return (
      <Link
        href={href}
        className={styles.link}
        aria-label={title}
        style={{ display: "inline-flex", lineHeight: 0 }}
      >
        {node}
      </Link>
    );
  }
  return node;
}

function Wordmark({
  height,
  className,
  title,
  inverted,
}: {
  height: number;
  className: string;
  title: string;
  inverted: boolean;
}) {
  const ink = inverted ? CREAM : GREEN;
  const fontSize = height * 0.92;

  return (
    <span
      className={`${styles.wordmark} ${className}`}
      style={{ fontSize, color: ink, height }}
      role="img"
      aria-label={title}
    >
      <span>Barbe</span>
      <span className={styles.ll}>
        <span className={styles.llLetters} style={{ color: ink }}>
          ll
        </span>
        <span className={styles.barbell} aria-hidden>
          <span className={styles.plate} style={{ background: AMBER }} />
          <span className={styles.bar} style={{ background: AMBER }} />
          <span className={styles.plate} style={{ background: AMBER }} />
        </span>
      </span>
      <span>ist</span>
    </span>
  );
}

function IconMark({
  height,
  className,
  title,
}: {
  height: number;
  className: string;
  title: string;
}) {
  return (
    <span
      className={`${styles.iconBox} ${className}`}
      style={{ width: height, height }}
      role="img"
      aria-label={title}
    >
      <LlGlyph size={height * 0.58} color={GREEN} />
    </span>
  );
}

function Lockup({
  height,
  className,
  title,
  inverted,
}: {
  height: number;
  className: string;
  title: string;
  inverted: boolean;
}) {
  const ink = inverted ? WHITE : GREEN;
  const boxBg = inverted ? GREEN : WHITE;
  const boxBorder = inverted ? "transparent" : BORDER;
  const glyphColor = inverted ? CREAM : GREEN;
  const iconSize = height;
  const textSize = height * 0.62;

  return (
    <span
      className={`${styles.lockup} ${className}`}
      style={{ height, gap: Math.max(8, height * 0.28) }}
      role="img"
      aria-label={title}
    >
      <span
        className={styles.iconBox}
        style={{
          width: iconSize,
          height: iconSize,
          background: boxBg,
          borderColor: boxBorder,
          borderRadius: Math.max(7, height * 0.24),
        }}
      >
        <LlGlyph size={iconSize * 0.58} color={glyphColor} />
      </span>
      <span
        className={styles.lockupText}
        style={{ fontSize: textSize, color: ink }}
      >
        Barbellist
      </span>
    </span>
  );
}

/** Geometric “ll” + amber barbell (matches design mark). */
function LlGlyph({ size, color }: { size: number; color: string }) {
  const plate = size * 0.16;
  const barH = size * 0.08;
  const barW = size * 0.72;
  const stemW = size * 0.22;
  const stemH = size * 0.92;
  const gap = size * 0.12;

  return (
    <span
      className={styles.glyph}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className={styles.glyphStem}
        style={{
          width: stemW,
          height: stemH,
          background: color,
          left: `calc(50% - ${stemW + gap / 2}px)`,
        }}
      />
      <span
        className={styles.glyphStem}
        style={{
          width: stemW,
          height: stemH,
          background: color,
          left: `calc(50% + ${gap / 2}px)`,
        }}
      />
      <span className={styles.glyphBarbell}>
        <span
          style={{
            width: plate,
            height: plate,
            borderRadius: "50%",
            background: AMBER,
          }}
        />
        <span
          style={{
            width: barW,
            height: barH,
            borderRadius: barH,
            background: AMBER,
          }}
        />
        <span
          style={{
            width: plate,
            height: plate,
            borderRadius: "50%",
            background: AMBER,
          }}
        />
      </span>
    </span>
  );
}
