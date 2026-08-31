// ─── SECURITY: Server-side Telegram proxy ────────────────────────────────────
// The bot token NEVER leaves the server. The client sends the message text,
// and this edge function forwards it to the Telegram API using the secret token.
// Deploy: npx supabase functions deploy send-telegram --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!BOT_TOKEN || !CHAT_ID) {
      return new Response(
        JSON.stringify({ error: "Telegram not configured on server" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, buttons } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── SECURITY: Limit message length to prevent abuse ───
    const sanitizedMessage = message.slice(0, 4000);

    // ─── SECURITY: Only allow https:// button URLs, cap count/length ───
    // This endpoint has no JWT verification (see deploy comment above), so
    // treat all input as untrusted even though only our own client calls it.
    const safeButtons = Array.isArray(buttons)
      ? buttons
          .filter(
            (b): b is { text: string; url: string } =>
              b && typeof b.text === "string" && typeof b.url === "string" && b.url.startsWith("https://")
          )
          .slice(0, 3)
          .map((b) => ({ text: b.text.slice(0, 64), url: b.url.slice(0, 512) }))
      : [];

    const payload: Record<string, unknown> = {
      chat_id: CHAT_ID,
      text: sanitizedMessage,
      parse_mode: "HTML",
    };
    if (safeButtons.length > 0) {
      payload.reply_markup = { inline_keyboard: [safeButtons.map((b) => ({ text: b.text, url: b.url }))] };
    }

    const tgResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const tgData = await tgResponse.json();

    return new Response(
      JSON.stringify({ ok: tgData.ok }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
