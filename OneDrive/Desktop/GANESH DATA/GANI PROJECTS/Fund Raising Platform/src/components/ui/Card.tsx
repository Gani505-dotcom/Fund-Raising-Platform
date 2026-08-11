import { type ReactNode } from "react";
import { classNames } from "@/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({ children, className, hover = false, padding = "md" }: CardProps) {
  return (
    <div
      className={classNames(
        "bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft",
        hover && "card-hover",
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
