// ─── SECURITY: Server-side Paystack payment verification ─────────────────────
// After the client reports a successful payment, this function independently
// verifies the transaction with Paystack's API using the SECRET key.
// This prevents amount tampering — even if a hacker modifies the client-side
// amount, the server will catch the discrepancy.
// Deploy: npx supabase functions deploy verify-payment --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!PAYSTACK_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Server not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { reference, expectedAmount, bookingRef } = await req.json();

    if (!reference || !expectedAmount || !bookingRef) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── Step 1: Verify payment with Paystack ───
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data?.status !== "success") {
      return new Response(
        JSON.stringify({ verified: false, reason: "Payment not successful at Paystack" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── Step 2: Verify amount matches ───
    const paidAmountPesewas = verifyData.data.amount; // Paystack returns amount in pesewas
    const expectedAmountPesewas = Math.round(expectedAmount * 100);

    if (paidAmountPesewas !== expectedAmountPesewas) {
      // ── SECURITY: Amount mismatch detected — possible tampering ──
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Flag the booking as suspicious
      await supabase
        .from("bookings")
        .update({ status: "flagged", special_requests: `⚠️ AMOUNT MISMATCH: Paid ${paidAmountPesewas/100} but expected ${expectedAmount}` })
        .eq("booking_reference", bookingRef);

      return new Response(
        JSON.stringify({ 
          verified: false, 
          reason: "Amount mismatch",
          paid: paidAmountPesewas / 100,
          expected: expectedAmount,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── Step 3: Mark booking as verified ───
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("booking_reference", bookingRef);

    return new Response(
      JSON.stringify({ verified: true, amount: paidAmountPesewas / 100 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
