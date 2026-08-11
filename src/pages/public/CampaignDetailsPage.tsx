import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Users, Calendar, Target, ArrowLeft, Share2, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Campaign } from "@/types";
import { formatCurrency, getProgressPercentage, getDaysRemaining, formatDate } from "@/utils";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import ShareButtons from "@/components/ShareButtons";
import { Skeleton } from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";

export default function CampaignDetailsPage() {
  const { slug } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error || !data) {
        setError(true);
      } else {
        setCampaign(data);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="w-full h-96 rounded-2xl" />
        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <ErrorState title="Campaign not found" message="This campaign may have been removed or is no longer active." action={<Link to="/campaigns"><Button>Back to Campaigns</Button></Link>} />
      </div>
    );
  }

  const percentage = getProgressPercentage(campaign.raised_amount, campaign.goal_amount);
  const daysLeft = getDaysRemaining(campaign.end_date);
  const shareUrl = `${window.location.origin}/campaigns/${campaign.slug}`;

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-50 to-white dark:from-gray-950 dark:to-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/campaigns" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Campaigns
          </Link>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {campaign.image && (
                <div className="rounded-2xl overflow-hidden mb-6 shadow-soft">
                  <img src={campaign.image} alt={campaign.title} className="w-full h-96 object-cover" />
                </div>
              )}
              <Badge variant="primary" size="sm">{campaign.category}</Badge>
              <h1 className="mt-3 text-3xl font-bold font-display text-gray-900 dark:text-gray-100">{campaign.title}</h1>
              <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">{campaign.description}</p>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Share this campaign</h3>
                <ShareButtons url={shareUrl} title={campaign.title} text={`Support ${campaign.title} on NayePankh Foundation`} variant="grid" />
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card padding="lg" className="sticky top-24">
                <div className="text-center pb-4 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-3xl font-bold gradient-text">{formatCurrency(campaign.raised_amount)}</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">raised of {formatCurrency(campaign.goal_amount)} goal</p>
                </div>
                <div className="mt-4">
                  <ProgressBar value={percentage} showLabel />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <Users className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{Math.floor(campaign.raised_amount / 1500)}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Donors</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <Clock className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{daysLeft ?? "—"}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Days Left</p>
                  </div>
                </div>
                {campaign.end_date && (
                  <p className="mt-4 text-xs text-center text-gray-400 dark:text-gray-500">
                    Campaign ends on {formatDate(campaign.end_date)}
                  </p>
                )}
                <Link to={`/donate?campaign=${campaign.slug}`} className="mt-4 block">
                  <Button fullWidth size="lg" leftIcon={<Heart className="w-5 h-5" />}>
                    Donate Now
                  </Button>
                </Link>
                <Link to={`/donate?ref=&campaign=${campaign.slug}`} className="mt-2 block">
                  <Button fullWidth variant="outline">
                    Share with Friends
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
