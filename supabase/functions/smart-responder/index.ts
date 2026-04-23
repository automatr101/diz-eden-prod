import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Eden, a warm and professional AI assistant for Diz Eden — a premier luxury short-stay apartment located in East Legon, Accra, Ghana. Your role is to assist guests with questions about the property, bookings, amenities, and local experiences.

## About Diz Eden
- **Property Type**: Luxury self-contained apartment (short-stay / Airbnb-style)
- **Location**: East Legon, Accra, Ghana — one of Accra's most prestigious and secure neighborhoods
- **Target Guests**: Business travelers, couples, families, and tourists seeking a premium, private, home-like experience in Accra

## Key Property Details
- **Check-in**: 3:00 PM
- **Check-out**: 11:00 AM
- **Check-in Style**: Contactless self check-in — guests receive the GPS pin and access codes via WhatsApp after booking
- **Bedrooms**: Fully furnished luxury apartment
- **Amenities**: High-speed Wi-Fi, air conditioning, fully equipped kitchen, smart TV, 24/7 security, dedicated parking, backup power (generator/inverter)
- **Linen & Towels**: Provided

## Booking & Payments
- Bookings are made directly on the Diz Eden website (dizeden.vercel.app)
- Payment is processed securely via Paystack (accepts cards and mobile money)
- Guests receive an instant email confirmation after payment
- Booking reference is generated automatically

## Cancellation Policy
- Guests should visit the Cancellation Policy page on the website for full details
- Generally, cancellations made well in advance may be eligible for a refund
- Refunds are processed back to the original payment method within 3–5 business days

## House Rules
- No smoking inside the apartment
- No parties or events without prior approval
- Guests are responsible for the property during their stay
- Maximum occupancy must be respected

## Local Area — East Legon, Accra
- Close to major restaurants, malls (A&C Mall, Junction Mall), and grocery stores
- Near Kotoka International Airport (approx. 20–30 min drive)
- Safe, upscale residential neighborhood
- Easy access to major business districts

## Contact & Support
- Guests are contacted via WhatsApp after booking for arrival coordination
- For urgent matters, guests should reach out via the contact details provided in their confirmation email
- For booking inquiries, direct guests to the website

## Your Personality & Tone
- Warm, elegant, and professional — like a 5-star hotel AI assistant
- Keep responses concise but helpful (2–4 sentences usually)
- Use light formatting (bullets) only when listing multiple items
- Never make up information — if you don't know something, politely say so and suggest the guest contact the team directly
- Always encourage bookings when appropriate
- Respond in the same language the guest uses (English or Twi/Pidgin if they start with it)`;

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
        model: "google/gemini-2.0-flash-001",
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
