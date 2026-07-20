import { type HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

export function Card({
  padded = true,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-[#EEE9DD] bg-white shadow-[0_1px_2px_rgba(31,31,31,0.04)] ${padded ? "p-[18px]" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
