import { classNames } from "@/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "error";
  showLabel?: boolean;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

const colors = {
  primary: "from-primary-500 to-primary-600",
  secondary: "from-secondary-500 to-secondary-600",
  accent: "from-accent-500 to-accent-600",
  success: "from-success-500 to-success-600",
  warning: "from-warning-500 to-warning-600",
  error: "from-error-500 to-error-600",
};

const sizes = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export default function ProgressBar({
  value,
  max = 100,
  className,
  color = "primary",
  showLabel = false,
  animated = true,
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={classNames("w-full", className)}>
      <div className={classNames("w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden", sizes[size])}>
        <div
          className={classNames(
            "h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out",
            colors[color],
            animated && "animate-progress",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1.5 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{percentage}% complete</span>
          <span>{percentage}%</span>
        </div>
      )}
    </div>
  );
}
