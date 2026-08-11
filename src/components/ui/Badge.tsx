import type { ReactNode } from "react";
import { classNames } from "@/utils";

type Variant = "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  size?: "sm" | "md";
}

const variants: Record<Variant, string> = {
  primary: "bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300",
  secondary: "bg-secondary-100 text-secondary-700 dark:bg-secondary-950 dark:text-secondary-300",
  success: "bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-300",
  warning: "bg-warning-100 text-warning-700 dark:bg-warning-950 dark:text-warning-300",
  error: "bg-error-100 text-error-700 dark:bg-error-950 dark:text-error-300",
  info: "bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300",
  neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const sizes = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

export default function Badge({ children, variant = "neutral", size = "md" }: BadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center font-semibold rounded-full",
        variants[variant],
        sizes[size],
      )}
    >
      {children}
    </span>
  );
}
