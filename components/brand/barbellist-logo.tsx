import { Logo, LogoLockupReversed } from "@/components/brand/logo";

type BarbellistLogoProps = {
  /** horizontal = lockup; stacked = wordmark (large) */
  layout?: "horizontal" | "stacked";
  /** light = reversed (on dark); dark = green on light */
  variant?: "light" | "dark";
  markSize?: number;
  wordmarkSize?: number;
  gap?: number;
  href?: string;
  className?: string;
};

/**
 * Backward-compatible wrapper around the new Logo system.
 * Prefer importing `Logo` from `@/components/brand/logo` for new code.
 */
export function BarbellistLogo({
  layout = "horizontal",
  variant = "dark",
  markSize = 38,
  wordmarkSize = 28,
  href = "/home",
  className = "",
}: BarbellistLogoProps) {
  if (layout === "stacked") {
    return (
      <Logo
        variant={variant === "light" ? "reversed" : "wordmark"}
        height={wordmarkSize}
        href={href}
        className={className}
      />
    );
  }

  if (variant === "light") {
    return (
      <LogoLockupReversed
        height={Math.max(markSize, 28)}
        href={href}
        className={className}
      />
    );
  }

  return (
    <Logo
      variant="lockup"
      height={Math.max(markSize, 28)}
      href={href}
      className={className}
    />
  );
}
