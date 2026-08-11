import { Link } from "react-router-dom";
import { Heart, Users, Calendar, ArrowRight } from "lucide-react";
import type { Campaign } from "@/types";
import { formatCurrency, getProgressPercentage, getDaysRemaining, classNames } from "@/utils";
import ProgressBar from "./ui/ProgressBar";
import Badge from "./ui/Badge";

interface CampaignCardProps {
  campaign: Campaign;
}

const categoryColors: Record<string, "primary" | "secondary" | "accent" | "success" | "warning" | "info"> = {
  Education: "primary",
  Healthcare: "secondary",
  Food: "warning",
  "Women Empowerment": "accent",
  "Child Welfare": "success",
  "Emergency Relief": "error" as never,
};

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const percentage = getProgressPercentage(campaign.raised_amount, campaign.goal_amount);
  const daysLeft = getDaysRemaining(campaign.end_date);
  const badgeColor = categoryColors[campaign.category] ?? "neutral";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-soft card-hover flex flex-col">
      <div className="relative h-48 overflow-hidden">
        {campaign.image ? (
          <img
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-950 dark:to-secondary-950" />
        )}
        <div className="absolute top-3 left-3">
          <Badge variant={badgeColor} size="sm">{campaign.category}</Badge>
        </div>
        {daysLeft !== null && daysLeft <= 30 && (
          <div className="absolute top-3 right-3">
            <Badge variant="error" size="sm">{daysLeft} days left</Badge>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-snug">{campaign.title}</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{campaign.short_description}</p>

        <div className="mt-4">
          <ProgressBar value={percentage} color={percentage >= 75 ? "success" : "primary"} size="sm" />
          <div className="mt-2 flex justify-between text-xs">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(campaign.raised_amount)}
            </span>
            <span className="text-gray-400 dark:text-gray-500">
              of {formatCurrency(campaign.goal_amount)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" /> {percentage}% funded
          </span>
          {daysLeft !== null && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {daysLeft} days
            </span>
          )}
        </div>

        <div className="mt-5 flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Link
            to={`/campaigns/${campaign.slug}`}
            className="flex-1 text-center py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 hover:text-primary-600 transition-all"
          >
            View Campaign
          </Link>
          <Link
            to={`/donate?campaign=${campaign.slug}`}
            className={classNames(
              "flex-1 text-center py-2.5 text-sm font-semibold rounded-xl transition-all",
              "bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md",
            )}
          >
            Donate
          </Link>
        </div>
      </div>
    </div>
  );
}
