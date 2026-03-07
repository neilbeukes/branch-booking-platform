import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gray-900 text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
  size?: "default" | "sm" | "icon";
}

const sizeStyles = {
  default: "px-4 py-2.5 text-sm font-medium rounded-lg",
  sm: "px-3 py-1.5 text-sm font-medium rounded-lg",
  icon: "p-2 rounded-lg",
};

export function Button({
  variant = "primary",
  size = "default",
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const base = "inline-flex items-center justify-center transition";
  const sizeClass = sizeStyles[size];
  const variantClass = variantStyles[variant];

  return (
    <button
      type={type}
      className={`${base} ${sizeClass} ${variantClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
