import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ReferrerRow {
  id: string;
  name: string;
  referral_code: string;
  is_active: boolean;
}

interface CampaignRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  goal_amount: number;
  raised_amount: number;
}

interface DonationRow {
  id: string;
  transaction_id: string;
  amount: number;
  status: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || url.pathname.split("/").pop();

    // ─── VALIDATE REFERRAL ─────────────────────────────────────
    // GET /donate?action=validate-referral&code=NPF-GANI-8X92
    if (action === "validate-referral") {
      const code = url.searchParams.get("code");
      if (!code) {
        return json({ valid: false, error: "Missing referral code" }, 400);
      }

      const { data: referrer, error } = await supabase
        .from("profiles")
        .select("id, name, referral_code, is_active")
        .eq("referral_code", code.toUpperCase())
        .maybeSingle();

      if (error) throw error;
      if (!referrer || !referrer.is_active) {
        return json({ valid: false, error: "Invalid or inactive referral code" }, 200);
      }

      // Record the click
      const userAgent = req.headers.get("user-agent") || "";
      const forwarded = req.headers.get("x-forwarded-for") || "";
      const ip = forwarded.split(",")[0].trim() || "unknown";

      await supabase.from("referral_clicks").insert({
        referral_code: referrer.referral_code,
        user_id: referrer.id,
        ip_address: ip,
        user_agent: userAgent,
      });

      return json({ valid: true, referrer: { name: referrer.name, referral_code: referrer.referral_code } });
    }

    // ─── CREATE ORDER ──────────────────────────────────────────
    // POST /donate?action=create-order { amount, referralCode, campaignId, donorName, donorEmail, donorPhone, isAnonymous, message }
    if (action === "create-order" && req.method === "POST") {
      const body = await req.json();
      const {
        amount,
        referralCode,
        campaignId,
        donorName,
        donorEmail,
        donorPhone,
        isAnonymous,
        message,
      } = body;

      // Validate amount
      const amt = Number(amount);
      if (!amt || amt < 10) {
        return json({ error: "Minimum donation amount is ₹10" }, 400);
      }
      if (amt > 10000000) {
        return json({ error: "Donation amount exceeds maximum limit" }, 400);
      }
      if (!donorName || !donorEmail) {
        return json({ error: "Donor name and email are required" }, 400);
      }

      // Validate referral code server-side (never trust client)
      let referrerId: string | null = null;
      let refCode: string | null = null;
      if (referralCode) {
        const { data: referrer, error } = await supabase
          .from("profiles")
          .select("id, referral_code, is_active")
          .eq("referral_code", referralCode.toUpperCase())
          .maybeSingle();

        if (error) throw error;
        if (referrer && referrer.is_active) {
          referrerId = referrer.id;
          refCode = referrer.referral_code;
        }
      }

      // Validate campaign if provided
      let campaign: CampaignRow | null = null;
      if (campaignId) {
        const { data: camp, error } = await supabase
          .from("campaigns")
          .select("id, title, slug, status, goal_amount, raised_amount")
          .eq("id", campaignId)
          .maybeSingle();

        if (error) throw error;
        if (!camp || camp.status !== "active") {
          return json({ error: "Campaign is not active or does not exist" }, 400);
        }
        campaign = camp;
      }

      // Create pending donation record
      const orderId = "ORDER_" + crypto.randomUUID().replace(/-/g, "").substring(0, 16);
      const { data: donation, error: insertError } = await supabase
        .from("donations")
        .insert({
          donor_name: donorName,
          donor_email: donorEmail,
          donor_phone: donorPhone || null,
          amount: Math.round(amt),
          campaign_id: campaign?.id || null,
          referrer_id: referrerId,
          referral_code: refCode,
          payment_gateway: "mock",
          order_id: orderId,
          status: "pending",
          is_anonymous: !!isAnonymous,
          message: message || null,
        })
        .select("id, transaction_id, amount, status")
        .single();

      if (insertError) throw insertError;

      return json({
        orderId,
        donationId: donation.id,
        transactionId: donation.transaction_id,
        amount: donation.amount,
        paymentGateway: "mock",
        mockMode: true,
      });
    }

    // ─── VERIFY PAYMENT ────────────────────────────────────────
    // POST /donate?action=verify-payment { donationId, orderId, status: 'success'|'failed' }
    if (action === "verify-payment" && req.method === "POST") {
      const body = await req.json();
      const { donationId, orderId, status } = body;

      if (!donationId || !orderId) {
        return json({ error: "Missing donation ID or order ID" }, 400);
      }
      if (!["success", "failed"].includes(status)) {
        return json({ error: "Invalid payment status" }, 400);
      }

      // Fetch the donation to verify it exists and is pending
      const { data: donation, error: fetchError } = await supabase
        .from("donations")
        .select("id, transaction_id, amount, status, order_id, referrer_id, donor_name, campaign_id")
        .eq("id", donationId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!donation) {
        return json({ error: "Donation record not found" }, 404);
      }
      if (donation.order_id !== orderId) {
        return json({ error: "Order ID mismatch" }, 400);
      }
      if (donation.status !== "pending") {
        return json({ error: "Donation is already processed", donation }, 200);
      }

      // Generate payment ID
      const paymentId = "PAY_" + crypto.randomUUID().replace(/-/g, "").substring(0, 16);

      // Update donation status
      const { error: updateError } = await supabase
        .from("donations")
        .update({
          status,
          payment_id: status === "success" ? paymentId : null,
        })
        .eq("id", donationId);

      if (updateError) throw updateError;

      // If successful, create notification for referrer
      if (status === "success" && donation.referrer_id) {
        await supabase.from("notifications").insert({
          user_id: donation.referrer_id,
          title: "New Donation Received!",
          message: `You received a new donation of ₹${donation.amount.toLocaleString("en-IN")} from ${donation.donor_name}.`,
          type: "donation",
        });
      }

      return json({
        success: status === "success",
        transactionId: donation.transaction_id,
        paymentId: status === "success" ? paymentId : null,
        amount: donation.amount,
        donorName: donation.donor_name,
      });
    }

    // ─── ADMIN: CREATE CAMPAIGN ─────────────────────────────────
    if (action === "admin-campaign" && req.method === "POST") {
      const body = await req.json();
      const { title, description, shortDescription, goalAmount, image, category, startDate, endDate, slug } = body;

      if (!title || !description || !goalAmount) {
        return json({ error: "Missing required campaign fields" }, 400);
      }

      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          title,
          slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          description,
          short_description: shortDescription || description.substring(0, 120),
          goal_amount: Math.round(Number(goalAmount)),
          image,
          category: category || "General",
          start_date: startDate || null,
          end_date: endDate || null,
          status: "active",
        })
        .select("id, slug")
        .single();

      if (error) throw error;
      return json({ success: true, id: data.id, slug: data.slug });
    }

    return json({ error: "Unknown action" }, 404);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return json({ error: message }, 500);
  }
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
