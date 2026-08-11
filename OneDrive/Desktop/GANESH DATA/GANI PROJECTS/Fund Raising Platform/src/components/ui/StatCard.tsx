import { type ReactNode } from "react";
import { classNames } from "@/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "error";
  subtitle?: string;
}

const colors = {
  primary: { bg: "bg-primary-50 dark:bg-primary-950/50", text: "text-primary-600 dark:text-primary-400", ring: "ring-primary-100 dark:ring-primary-900" },
  secondary: { bg: "bg-secondary-50 dark:bg-secondary-950/50", text: "text-secondary-600 dark:text-secondary-400", ring: "ring-secondary-100 dark:ring-secondary-900" },
  accent: { bg: "bg-accent-50 dark:bg-accent-950/50", text: "text-accent-600 dark:text-accent-400", ring: "ring-accent-100 dark:ring-accent-900" },
  success: { bg: "bg-success-50 dark:bg-success-950/50", text: "text-success-600 dark:text-success-400", ring: "ring-success-100 dark:ring-success-900" },
  warning: { bg: "bg-warning-50 dark:bg-warning-950/50", text: "text-warning-600 dark:text-warning-400", ring: "ring-warning-100 dark:ring-warning-900" },
  error: { bg: "bg-error-50 dark:bg-error-950/50", text: "text-error-600 dark:text-error-400", ring: "ring-error-100 dark:ring-error-900" },
};

export default function StatCard({ label, value, icon: Icon, trend, color = "primary", subtitle }: StatCardProps) {
  const c = colors[color];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-soft card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
        </div>
        <div className={classNames("p-3 rounded-xl ring-1", c.bg, c.text, c.ring)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={classNames(
              "text-xs font-semibold",
              trend.positive ? "text-success-600 dark:text-success-400" : "text-error-600 dark:text-error-400",
            )}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
}
