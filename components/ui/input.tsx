import { type InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, className = "", id, ...props }, ref) {
    const inputId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="text-[13px] font-semibold text-foreground"
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border border-[#E4DFD4] bg-white px-4 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-[#A39E93] focus:border-primary focus:shadow-[0_0_0_3px_rgba(27,94,60,0.12)] ${error ? "border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]" : ""} ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-danger">{error}</p>
        ) : null}
      </div>
    );
  },
);
