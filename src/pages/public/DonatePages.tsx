import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Heart, Lock, ShieldCheck, XCircle } from "lucide-react";
import { supabase, callEdgeFunction } from "@/lib/supabase";
import type { Campaign, PublicProfile, VerifyPaymentResponse } from "@/types";
import { formatCurrency, getDonationLink, getProgressPercentage } from "@/utils";
import { MIN_DONATION, PRESET_AMOUNTS } from "@/constants";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";

export default function DonatePage() {
  const [params] = useSearchParams();
  const referralCode = params.get("ref")?.toUpperCase() ?? "";
  const campaignSlug = params.get("campaign") ?? "";
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [referrer, setReferrer] = useState<PublicProfile | null>(null);
  const [amount, setAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", anonymous: false });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const campaignQuery = campaignSlug
        ? supabase.from("campaigns").select("*").eq("slug", campaignSlug).maybeSingle()
        : supabase.from("campaigns").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle();
      const [campaignResult, referrerResult] = await Promise.all([
        campaignQuery,
        referralCode ? supabase.from("public_profiles").select("*").eq("referral_code", referralCode).maybeSingle() : Promise.resolve({ data: null }),
      ]);
      setCampaign(campaignResult.data);
      setReferrer(referrerResult.data);
      if (referralCode) {
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/donate?action=validate-referral&code=${encodeURIComponent(referralCode)}`, { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` } }).catch(() => undefined);
      }
      setLoading(false);
    })();
  }, [campaignSlug, referralCode]);

  const selectedAmount = customAmount ? Number(customAmount) : amount;
  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: e.target.value });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedAmount < MIN_DONATION) { toast(`Minimum donation is ${formatCurrency(MIN_DONATION)}.`, "error"); return; }
    setProcessing(true);
    try {
      const response = await callEdgeFunction("create-order", { method: "POST", body: JSON.stringify({ amount: selectedAmount, referralCode, campaignId: campaign?.id, donorName: form.name, donorEmail: form.email, donorPhone: form.phone, isAnonymous: form.anonymous, message: form.message }) });
      const order = await response.json();
      if (!response.ok || !order.donationId) throw new Error(order.error ?? "Unable to start payment.");
      const verifyResponse = await callEdgeFunction("verify-payment", { method: "POST", body: JSON.stringify({ donationId: order.donationId, orderId: order.orderId, status: "success" }) });
      const result = await verifyResponse.json() as VerifyPaymentResponse & { error?: string };
      if (!verifyResponse.ok || !result.success) throw new Error(result.error ?? "Payment could not be completed.");
      navigate("/donation-success", { state: { ...result, campaignTitle: campaign?.title ?? "NayePankh Foundation", referrerName: referrer?.name ?? null } });
    } catch (error) { toast(error instanceof Error ? error.message : "Payment could not be completed.", "error"); } finally { setProcessing(false); }
  };

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-500">Preparing your secure donation page...</div>;
  if (!campaign) return <div className="max-w-5xl mx-auto px-4 py-20 text-center"><h1 className="text-2xl font-bold">No active campaign found</h1><Link to="/campaigns" className="text-primary-600 mt-3 inline-block">Browse campaigns</Link></div>;

  return <div className="py-10"><div className="max-w-5xl mx-auto px-4"><div className="text-center mb-8"><Badge variant="primary">Secure donation</Badge><h1 className="mt-3 text-3xl font-bold font-display text-gray-900 dark:text-gray-100">Support {campaign.title}</h1><p className="mt-2 text-gray-500">Your contribution can help create meaningful change.</p>{referrer&&<p className="mt-3 text-sm text-primary-600">You are supporting {referrer.name}'s fundraiser</p>}</div><div className="grid lg:grid-cols-5 gap-8"><div className="lg:col-span-2"><Card padding="none" className="overflow-hidden sticky top-24"><img src={campaign.image ?? ""} alt={campaign.title} className="w-full h-52 object-cover"/><div className="p-5"><h2 className="font-bold text-gray-900 dark:text-gray-100">{campaign.title}</h2><p className="mt-2 text-sm text-gray-500 line-clamp-4">{campaign.short_description}</p><div className="mt-5"><ProgressBar value={getProgressPercentage(campaign.raised_amount,campaign.goal_amount)} size="sm"/><div className="mt-2 flex justify-between text-xs"><strong>{formatCurrency(campaign.raised_amount)} raised</strong><span className="text-gray-400">Goal {formatCurrency(campaign.goal_amount)}</span></div></div></div></Card></div><Card padding="lg" className="lg:col-span-3"><form onSubmit={submit} className="space-y-6"><div><h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Make a donation</h2><p className="mt-1 text-sm text-gray-500">Every contribution makes a difference.</p></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Choose an amount</label><div className="grid grid-cols-3 gap-2">{PRESET_AMOUNTS.map(value=><button type="button" key={value} onClick={()=>{setAmount(value);setCustomAmount("")}} className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${amount===value&&!customAmount?'border-primary-500 bg-primary-50 text-primary-700':'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>{formatCurrency(value)}</button>)}</div><div className="mt-3"><Input label="Custom amount" type="number" min={MIN_DONATION} value={customAmount} onChange={e=>setCustomAmount(e.target.value)} placeholder="Enter another amount"/></div></div><div className="space-y-4"><Input label="Full name" value={form.name} onChange={update("name")} required/><Input label="Email address" type="email" value={form.email} onChange={update("email")} required/><Input label="Phone number" type="tel" value={form.phone} onChange={update("phone")}/><Textarea label="Optional message" rows={3} value={form.message} onChange={update("message")} placeholder="Leave an encouraging message"/><label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><input type="checkbox" checked={form.anonymous} onChange={e=>setForm({...form,anonymous:e.target.checked})} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"/> Donate anonymously</label></div><Button type="submit" fullWidth size="lg" loading={processing} leftIcon={<Heart className="w-5 h-5"/>}>Donate {formatCurrency(selectedAmount||0)}</Button><div className="flex items-center justify-center gap-4 text-xs text-gray-400"><span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5"/> Secure checkout</span><span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5"/> Demo payment mode</span></div></form></Card></div></div></div>;
}

export function DonationSuccessPage() { const location=useLocation(); const data=location.state as Partial<VerifyPaymentResponse>&{campaignTitle?:string;referrerName?:string|null}|null; if(!data?.transactionId)return <RedirectMessage title="Donation completed" text="Your donation was processed successfully."/>; return <div className="max-w-xl mx-auto px-4 py-20"><Card padding="lg" className="text-center"><div className="w-16 h-16 rounded-full bg-success-100 text-success-600 flex items-center justify-center mx-auto"><CheckCircle2 className="w-9 h-9"/></div><h1 className="mt-5 text-3xl font-bold font-display">Thank You for Your Donation!</h1><p className="mt-3 text-gray-500">Your contribution has been successfully processed.</p><div className="mt-8 rounded-2xl bg-gray-50 dark:bg-gray-800 p-5 text-left space-y-3 text-sm"><div className="flex justify-between"><span className="text-gray-500">Amount</span><strong>{formatCurrency(data.amount??0)}</strong></div><div className="flex justify-between"><span className="text-gray-500">Campaign</span><strong>{data.campaignTitle}</strong></div><div className="flex justify-between"><span className="text-gray-500">Transaction ID</span><strong className="font-mono text-xs">{data.transactionId}</strong></div>{data.referrerName&&<div className="flex justify-between"><span className="text-gray-500">Fundraiser</span><strong>{data.referrerName}</strong></div>}</div><Link to="/" className="mt-6 block"><Button fullWidth>Return Home</Button></Link></Card></div> }
export function DonationFailurePage(){return <div className="max-w-xl mx-auto px-4 py-20"><Card padding="lg" className="text-center"><div className="w-16 h-16 rounded-full bg-error-100 text-error-600 flex items-center justify-center mx-auto"><XCircle className="w-9 h-9"/></div><h1 className="mt-5 text-3xl font-bold">Payment Unsuccessful</h1><p className="mt-3 text-gray-500">No successful donation was recorded. You can try again or browse another campaign.</p><div className="mt-6 flex gap-3 justify-center"><Link to="/campaigns"><Button variant="outline">Browse Campaigns</Button></Link><Link to="/donate"><Button>Try Again</Button></Link></div></Card></div>}
function RedirectMessage({title,text}:{title:string;text:string}){return <div className="max-w-xl mx-auto px-4 py-20 text-center"><CheckCircle2 className="w-12 h-12 text-success-500 mx-auto"/><h1 className="mt-4 text-2xl font-bold">{title}</h1><p className="mt-2 text-gray-500">{text}</p><Link to="/" className="text-primary-600 mt-4 inline-block">Return home</Link></div>}
