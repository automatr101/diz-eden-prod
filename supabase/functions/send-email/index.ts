import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, to, name, bookingRef, checkIn, checkOut, propertyName } = await req.json();

    if (!action || !to) {
      throw new Error("Missing required parameters");
    }

    console.log(`Processing email: ${action} to ${to} for Booking: ${bookingRef}`);

    let subject = "";
    let html = "";

    if (action === "confirmation") {
      subject = `Booking Confirmed: Your stay at ${propertyName || "Diz Eden"}`;
      html = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #1a1a1a; padding: 20px;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaeb;">
            <h1 style="color: #d4af37; font-weight: 300; letter-spacing: 2px;">DIZ EDEN</h1>
          </div>
          <div style="padding: 30px 0;">
            <h2 style="font-weight: 400; font-size: 24px; margin-bottom: 20px;">Welcome to Eden, ${name}</h2>
            <p style="color: #4a4a4a; line-height: 1.6;">Your luxurious stay at <strong>${propertyName || "Diz Eden"}</strong> is fully confirmed. We are thrilled to host you and promise an unforgettable experience.</p>
            
            <div style="background-color: #f9f9f9; border-left: 4px solid #d4af37; padding: 20px; margin: 30px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Booking Reference:</strong> ${bookingRef}</p>
              <p style="margin: 0 0 10px 0;"><strong>Check-in:</strong> ${checkIn} (from 3:00 PM)</p>
              <p style="margin: 0;"><strong>Check-out:</strong> ${checkOut} (by 11:00 AM)</p>
            </div>
            
            <h3 style="font-weight: 400; margin-top: 30px;">Important Details</h3>
            <p style="color: #4a4a4a; line-height: 1.6;">Our concierge team will reach out to you via WhatsApp shortly to coordinate your arrival timezone and provide the exact GPS pin and access codes.</p>
          </div>
          <div style="text-align: center; padding-top: 30px; border-top: 1px solid #eaeaeb; color: #888; font-size: 12px; letter-spacing: 1px;">
            <p>PREMIER LUXURY LIVING — EAST LEGON, ACCRA</p>
          </div>
        </div>
      `;
    } else if (action === "cancellation") {
      subject = `Booking Cancelled: ${propertyName || "Diz Eden"}`;
      html = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #1a1a1a; padding: 20px;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaeb;">
            <h1 style="color: #d4af37; font-weight: 300; letter-spacing: 2px;">DIZ EDEN</h1>
          </div>
          <div style="padding: 30px 0;">
            <h2 style="font-weight: 400; font-size: 24px; margin-bottom: 20px;">Booking Cancellation</h2>
            <p style="color: #4a4a4a; line-height: 1.6;">Dear ${name},</p>
            <p style="color: #4a4a4a; line-height: 1.6;">Your booking (<strong>Ref: ${bookingRef}</strong>) has been successfully cancelled as requested.</p>
            <p style="color: #4a4a4a; line-height: 1.6;">If you are eligible for a refund according to our cancellation policy, it will automatically be processed to your original payment method within the next 3-5 business days.</p>
            <p style="color: #4a4a4a; line-height: 1.6;">We hope to welcome you to Diz Eden in the future.</p>
          </div>
        </div>
      `;
    }

    const payload = {
      from: "Diz Eden <onboarding@resend.dev>",
      to: [to],
      bcc: ["team.automatr@gmail.com"], // ALWAYS send a copy to the admin to ensure records are kept
      subject: subject,
      html: html,
    };

    console.log("Sending payload to Resend:", JSON.stringify(payload));

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    
    if (!res.ok) {
      console.error("Resend API Error:", JSON.stringify(data));
      throw new Error(data.message || "Failed to send email via Resend");
    }

    console.log("Email sent successfully:", JSON.stringify(data));
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Email Function Failure:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
