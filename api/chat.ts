// Eden, the Diz Eden AI concierge. Runs as a Vercel serverless function so the
// chatbot doesn't depend on Supabase being up. The OpenRouter key lives in the
// Vercel env var OPENROUTER_API_KEY and never reaches the browser.

const MODEL = "google/gemini-2.5-flash-lite";

const SYSTEM_PROMPT = `You are Eden, a warm and professional AI assistant for Diz Eden — a premier luxury short-stay apartment located in East Legon, Accra, Ghana. Your role is to assist guests with questions about the property, bookings, amenities, and local experiences.

## About Diz Eden & The Experience
- **Property Type**: Luxury self-contained residences (short-stay / Airbnb-style)
- **Location**: East Legon, Accra, Ghana — prestigious, secure, and upscale.
- **The Host**: Kweku, a dedicated Airbnb Superhost known for exceptional hospitality.
- **The Vibe**: Ultra-modern, serene, and sophisticated. "A place of serenity defined by you."
- **Social Proof**: Guests frequently praise the "ultra-modern" design, "super clean" standards, "premium linens," and "remarkable attention to detail."

## Key Property Details & Rates
- **1-Bedroom Luxury Suite**: GHS 1,200 per night (up to 2 guests)
- **2-Bedroom Luxury Residence**: GHS 1,800 per night (up to 4 guests)
- **Check-in**: 3:00 PM onwards | **Check-out**: By 11:00 AM
- **Check-in Style**: Contactless self check-in. Guests receive GPS and codes via WhatsApp.
- **Special Touches**: Every stay includes a "curated welcome hamper" and daily professional housekeeping.
- **Amenities**: High-speed Wi-Fi (Starlink/Fiber), AC, gourmet kitchen, Smart TV (Netflix/Prime), 24/7 Security, Backup Power (Essential in Accra), and private parking.

## Booking & Payments
- **Direct Booking**: Guests book at www.dizeden.com/booking — they pick dates, room type and guests, fill in their details, and tap "Book via WhatsApp". That opens WhatsApp with their booking details already written, addressed to the host (+233 25 607 1641). They just tap send.
- **Payment**: There is NO online/card payment on the website. Payment is arranged directly with the host on WhatsApp after the guest sends their request. Dates are only reserved once the host confirms and payment is received — never tell a guest their dates are held or confirmed just because they submitted the form.
- If a guest asks to pay by card online or says the site didn't take their payment, explain this and point them to WhatsApp +233 25 607 1641.

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

const MAX_MESSAGES = 12;
const MAX_CONTENT_CHARS = 1000;

// Best-effort per-instance limiter. Serverless instances are shared and
// recycled, so this slows casual abuse rather than guaranteeing a hard cap.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 15;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY is not set");
    return res.status(500).json({ error: "Chat is not configured" });
  }

  const ip = String(req.headers["x-forwarded-for"] ?? "unknown").split(",")[0].trim();
  if (rateLimited(ip)) {
    return res.status(429).json({ error: "Too many messages, please slow down" });
  }

  // Only user/assistant turns are accepted from the browser — a client must
  // never be able to inject its own "system" instructions.
  const incoming = req.body?.messages;
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return res.status(400).json({ error: "Missing messages" });
  }
  const messages = incoming
    .filter(
      (m: any) =>
        m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim()
    )
    .slice(-MAX_MESSAGES)
    .map((m: any) => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT_CHARS) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Invalid messages" });
  }

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://www.dizeden.com",
        "X-Title": "Diz Eden Concierge",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 400,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!upstream.ok) {
      console.error("OpenRouter error:", upstream.status, await upstream.text());
      return res.status(502).json({ error: "Upstream error" });
    }

    const data = await upstream.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(502).json({ error: "Empty reply" });
    }
    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error("Chat error:", err?.message);
    return res.status(502).json({ error: "Chat failed" });
  }
}
