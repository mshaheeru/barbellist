import { type HTMLAttributes } from "react";

type Tone = "default" | "success" | "warning" | "danger" | "accent";

const tones: Record<Tone, string> = {
  default: "bg-muted text-foreground",
  success: "bg-[#E7F0EA] text-[#2E7D4F]",
  warning: "bg-[#F8EFD9] text-[#A06B14]",
  danger: "bg-[#F9E4E1] text-[#C0392B]",
  accent: "bg-accent text-white",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
};

export function Badge({
  tone = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
