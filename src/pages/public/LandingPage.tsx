import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ArrowRight,
  Users,
  HandHeart,
  Target,
  TrendingUp,
  Shield,
  Sparkles,
  MessageCircle,
  CheckCircle2,
  Quote,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Campaign } from "@/types";
import { formatCurrency, getProgressPercentage } from "@/utils";
import { APP_TAGLINE, IMPACT_TIERS } from "@/constants";
import CampaignCard from "@/components/CampaignCard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { SkeletonCampaignCard } from "@/components/ui/Skeleton";

export default function LandingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRaised: 0, totalDonors: 0, totalCampaigns: 0 });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);
      setCampaigns(data ?? []);
      setLoading(false);

      const { data: allCamp } = await supabase
        .from("campaigns")
        .select("raised_amount, goal_amount")
        .eq("status", "active");
      if (allCamp) {
        const totalRaised = allCamp.reduce((sum, c) => sum + c.raised_amount, 0);
        setStats({
          totalRaised,
          totalDonors: 248,
          totalCampaigns: allCamp.length,
        });
      }
    })();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 dark:bg-primary-900 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-200 dark:bg-secondary-900 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                {APP_TAGLINE}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-gray-900 dark:text-gray-100 leading-tight">
                Empower Change.
                <br />
                <span className="gradient-text">One Donation at a Time.</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-xl">
                Support meaningful causes and help create a better future with NayePankh Foundation. Start your fundraising journey or contribute to campaigns that matter.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/campaigns">
                  <Button size="lg" leftIcon={<Heart className="w-5 h-5" />}>
                    Donate Now
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" leftIcon={<TrendingUp className="w-5 h-5" />}>
                    Start Fundraising
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary-500" />
                  Secure Payments
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary-500" />
                  Tax Deductible
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <Card padding="md" className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
                  <HandHeart className="w-8 h-8 mb-3 opacity-90" />
                  <p className="text-3xl font-bold">{formatCurrency(stats.totalRaised)}</p>
                  <p className="text-sm opacity-80 mt-1">Total Raised</p>
                </Card>
                <Card padding="md" className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white border-0 mt-8">
                  <Users className="w-8 h-8 mb-3 opacity-90" />
                  <p className="text-3xl font-bold">{stats.totalDonors}+</p>
                  <p className="text-sm opacity-80 mt-1">Generous Donors</p>
                </Card>
                <Card padding="md" className="bg-gradient-to-br from-accent-500 to-accent-600 text-white border-0">
                  <Target className="w-8 h-8 mb-3 opacity-90" />
                  <p className="text-3xl font-bold">{stats.totalCampaigns}</p>
                  <p className="text-sm opacity-80 mt-1">Active Campaigns</p>
                </Card>
                <Card padding="md" className="bg-gradient-to-br from-success-500 to-success-600 text-white border-0 mt-8">
                  <Heart className="w-8 h-8 mb-3 opacity-90" />
                  <p className="text-3xl font-bold">100%</p>
                  <p className="text-sm opacity-80 mt-1">Transparent</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 dark:text-gray-100">
              How It Works
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Start fundraising in three simple steps. Share your link, track donations, and make an impact.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Register & Get Your Code", desc: "Sign up and receive a unique referral code with your personalized donation link instantly." },
              { icon: MessageCircle, title: "Share Your Link", desc: "Share your donation link via WhatsApp, social media, or email with friends and family." },
              { icon: TrendingUp, title: "Track Your Impact", desc: "Watch your dashboard update in real-time as donations come through your referral link." },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="absolute -top-4 -left-2 w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-lg font-display">
                  {i + 1}
                </div>
                <Card padding="lg" className="h-full pt-8">
                  <step.icon className="w-10 h-10 text-primary-500 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 dark:text-gray-100">
                Active Campaigns
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Support a cause that resonates with you.</p>
            </div>
            <Link to="/campaigns">
              <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All Campaigns
              </Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCampaignCard key={i} />)
              : campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 dark:text-gray-100">
              Your Impact
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Every contribution creates ripples of change. Here's what your donation can do.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {IMPACT_TIERS.map((tier, i) => (
              <Card key={i} padding="lg" hover className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-7 h-7" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(tier.amount)}</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{tier.impact}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 dark:text-gray-100">
              Stories of Change
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Priya Sharma", role: "Volunteer", quote: "Fundraising through NayePankh was effortless. I raised ₹40,000 in just two weeks by sharing my link with friends and family." },
              { name: "Rahul Kumar", role: "Intern", quote: "The referral system is brilliant. I could see every donation in real-time on my dashboard. It felt amazing to track my impact." },
              { name: "Anjali Verma", role: "Donor", quote: "The donation process was smooth and secure. I love that I can see exactly which campaign my contribution supports." },
            ].map((t, i) => (
              <Card key={i} padding="lg">
                <Quote className="w-8 h-8 text-primary-200 dark:text-primary-800 mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">"{t.quote}"</p>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{t.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-display">Ready to Make a Difference?</h2>
          <p className="mt-4 text-lg opacity-90">
            Join our community of fundraisers and donors. Together, we can create lasting change.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100" leftIcon={<TrendingUp className="w-5 h-5" />}>
                Start Fundraising
              </Button>
            </Link>
            <Link to="/campaigns">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" leftIcon={<Heart className="w-5 h-5" />}>
                Browse Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
