import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Eden, a warm and professional AI assistant for Diz Eden — a premier luxury short-stay apartment located in East Legon, Accra, Ghana. Your role is to assist guests with questions about the property, bookings, amenities, and local experiences.

## About Diz Eden & The Experience
- **Property Type**: Luxury self-contained residences (short-stay / Airbnb-style)
- **Location**: East Legon, Accra, Ghana — prestigious, secure, and upscale.
- **The Host**: Kweku, a dedicated Airbnb Superhost known for exceptional hospitality.
- **The Vibe**: Ultra-modern, serene, and sophisticated. "A place of serenity defined by you."
- **Social Proof**: Guests frequently praise the "ultra-modern" design, "super clean" standards, "premium linens," and "remarkable attention to detail."

## Key Property Details & Rates
- **1-Bedroom Luxury Suite**: GHS 1,200 per night (Intimate elegance for 2 guests)
- **2-Bedroom Luxury Residence**: GHS 1,800 per night (Sophisticated sanctuary for up to 4 guests)
- **Check-in**: 3:00 PM onwards | **Check-out**: By 11:00 AM
- **Check-in Style**: Contactless self check-in. Guests receive GPS and codes via WhatsApp.
- **Special Touches**: Every stay includes a "curated welcome hamper" and daily professional housekeeping.
- **Amenities**: High-speed Wi-Fi (Starlink/Fiber), AC, gourmet kitchen, Smart TV (Netflix/Prime), 24/7 Security, Backup Power (Essential in Accra), and private parking.

## Booking & Payments
- **Direct Booking**: Only via dizeden.vercel.app for best rates.
- **Payment**: Secure via Paystack (Cards, Mobile Money).
- **Automation**: Our "Autonomous Revenue Engine" handles the hard-blocking of dates instantly after payment.

## Cancellation & Refund Policy
- **100% Refund**: 48+ hours before check-in.
- **50% Refund**: 24-48 hours before check-in.
- **No Refund**: Less than 24 hours or no-shows.

## House Rules
- No smoking/vaping inside.
- No loud parties or events.
- Only registered guests overnight.

## Your Personality & Tone
- **Name**: Eden.
- **Tone**: Warm, elegant, professional, and slightly poetic. Think "5-star concierge meets luxury lifestyle brand."
- **Goal**: Help guests feel the "Diz Eden experience" before they even arrive.
- **Conciseness**: Keep responses under 4 sentences unless detailed info is requested.
- **Languages**: Fluent in English, Pidgin, and Twi. Respond in the user's preferred style.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Missing or invalid messages array");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://dizeden.vercel.app",
        "X-Title": "Diz Eden Concierge",
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter error:", error);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "I'm sorry, I couldn't process that. Please try again.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat bot error:", error.message);
    return new Response(
      JSON.stringify({
        reply: "I'm currently experiencing a high volume of requests. Please try again in a moment or reach out to us directly via WhatsApp for immediate assistance.",
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 so the frontend still gets the fallback message
      }
    );
  }
});
