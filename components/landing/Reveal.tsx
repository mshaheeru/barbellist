"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  /** Animation variant */
  variant?: "up" | "fade" | "left" | "right" | "scale";
  /** Delay in ms before animating once visible */
  delay?: number;
  /** As HTML element */
  as?: "div" | "section" | "header" | "article";
  /** How much of the element must be visible (0–1) */
  threshold?: number;
  "aria-label"?: string;
};

export function Reveal({
  children,
  className = "",
  style,
  id,
  variant = "up",
  delay = 0,
  as: Tag = "div",
  threshold = 0.12,
  "aria-label": ariaLabel,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      id={id}
      ref={ref as never}
      aria-label={ariaLabel}
      className={`lp-reveal lp-reveal-${variant}${visible ? " is-visible" : ""} ${className}`.trim()}
      style={{
        ...style,
        transitionDelay: visible ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </Tag>
  );
}
