import { Link } from "react-router-dom";
import { Feather } from "lucide-react";
import { classNames } from "@/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  to?: string;
  className?: string;
}

const sizes = {
  sm: { box: "w-8 h-8", icon: "w-4 h-4", text: "text-base" },
  md: { box: "w-10 h-10", icon: "w-5 h-5", text: "text-lg" },
  lg: { box: "w-14 h-14", icon: "w-7 h-7", text: "text-2xl" },
};

export default function Logo({ size = "md", showText = true, to = "/", className }: LogoProps) {
  const s = sizes[size];
  const content = (
    <div className={classNames("flex items-center gap-2.5", className)}>
      <div
        className={`${s.box} rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white shadow-sm`}
      >
        <Feather className={s.icon} />
      </div>
      {showText && (
        <div className="leading-tight">
          <span className={`${s.text} font-bold font-display text-gray-900 dark:text-gray-100 block`}>
            NayePankh
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide">
            FUNDRAISING PORTAL
          </span>
        </div>
      )}
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }
  return content;
}
