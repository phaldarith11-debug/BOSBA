import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:   "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  secondary: "bg-gray-900 text-white hover:bg-gray-800 focus-visible:ring-gray-500",
  outline:   "border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50",
  ghost:     "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  danger:    "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
};

const sizes: Record<Size, string> = {
  sm:  "px-3 py-1.5 text-xs rounded-lg",
  md:  "px-4 py-2 text-sm rounded-xl",
  lg:  "px-6 py-3 text-base rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, disabled, className = "", children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      ].join(" ")}
      {...rest}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
});
