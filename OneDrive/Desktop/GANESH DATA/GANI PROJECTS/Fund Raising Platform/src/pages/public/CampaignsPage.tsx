import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Target, Eye, Users, Award, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Campaign } from "@/types";
import CampaignCard from "@/components/CampaignCard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SearchBar from "@/components/ui/SearchBar";
import FilterDropdown from "@/components/ui/FilterDropdown";
import { SkeletonCampaignCard } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { CATEGORIES } from "@/constants";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      setCampaigns(data ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = campaigns.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.short_description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || c.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-50 to-white dark:from-gray-950 dark:to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold font-display text-gray-900 dark:text-gray-100">Our Campaigns</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Every campaign is a step toward a better tomorrow. Find a cause that moves you and make a contribution today.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <SearchBar value={search} onChange={setSearch} placeholder="Search campaigns..." className="flex-1" />
            <FilterDropdown
              value={category}
              onChange={setCategory}
              options={[{ value: "all", label: "All Categories" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]}
              className="sm:w-48"
            />
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCampaignCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Heart className="w-8 h-8" />}
              title="No campaigns found"
              description="Try adjusting your search or filter to find campaigns to support."
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c) => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
