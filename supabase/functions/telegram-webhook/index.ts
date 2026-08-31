// ─── Telegram bot commands ────────────────────────────────────────────────
// Receives updates Telegram sends when someone messages the bot, and
// responds to a small set of slash-commands with live booking data.
//
// One-time setup after each deploy (registers this URL as the webhook and
// publishes the "/" command menu in Telegram — safe to re-run, it's
// idempotent):
//   curl "https://<project-ref>.supabase.co/functions/v1/telegram-webhook?action=register"
//
// SECURITY: only ever acts on messages from TELEGRAM_CHAT_ID — the business's
// own chat, the same one send-telegram already pushes notifications to.
// Anyone else who discovers and messages the bot is silently ignored.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COMMANDS = [
  { command: "today", description: "Who's checking in/out today" },
  { command: "bookings", description: "Next 5 upcoming confirmed bookings" },
  { command: "revenue", description: "Total confirmed revenue (matches admin Overview)" },
  { command: "help", description: "List available commands" },
];

async function tgCall(method: string, body: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

function reply(text: string) {
  return tgCall("sendMessage", { chat_id: CHAT_ID, text, parse_mode: "HTML" });
}

function money(n: number) {
  return `GH₵${n.toLocaleString()}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // ─── One-time self-registration ───
  if (req.method === "GET" && url.searchParams.get("action") === "register") {
    if (!BOT_TOKEN || !CHAT_ID || !SUPABASE_URL) {
      return new Response(JSON.stringify({ error: "Telegram/Supabase env not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-webhook`;
    const setWebhookRes = await tgCall("setWebhook", { url: webhookUrl });
    const setCommandsRes = await tgCall("setMyCommands", { commands: COMMANDS });
    return new Response(JSON.stringify({ webhookUrl, setWebhookRes, setCommandsRes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (req.method !== "POST") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!BOT_TOKEN || !CHAT_ID) {
      return new Response("ok", { headers: corsHeaders }); // ack Telegram either way
    }

    const update = await req.json().catch(() => null);
    const msg = update?.message;
    if (!msg?.text) {
      return new Response("ok", { headers: corsHeaders });
    }

    // Only the business's own chat — never act on messages from anyone else
    if (String(msg.chat?.id) !== CHAT_ID) {
      return new Response("ok", { headers: corsHeaders });
    }

    const cmd = msg.text.trim().split(/\s+/)[0].replace(/@\w+$/, "").toLowerCase();

    if (cmd === "/today") {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("bookings")
        .select("guest_name, check_in, check_out")
        .neq("status", "cancelled")
        .or(`check_in.eq.${today},check_out.eq.${today}`);

      const arrivals = (data || []).filter((b) => b.check_in === today);
      const departures = (data || []).filter((b) => b.check_out === today);

      const lines = [`📅 <b>Today (${today})</b>`, ""];
      lines.push(`🟢 <b>Arriving:</b> ${arrivals.length ? "" : "none"}`);
      arrivals.forEach((b) => lines.push(`• ${b.guest_name}`));
      lines.push("", `🔴 <b>Departing:</b> ${departures.length ? "" : "none"}`);
      departures.forEach((b) => lines.push(`• ${b.guest_name}`));

      await reply(lines.join("\n"));
    } else if (cmd === "/bookings") {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("bookings")
        .select("guest_name, check_in, check_out, total_amount, status")
        .neq("status", "cancelled")
        .gte("check_in", today)
        .order("check_in", { ascending: true })
        .limit(5);

      if (!data || data.length === 0) {
        await reply("📋 No upcoming bookings.");
      } else {
        const lines = data.map(
          (b) =>
            `• <b>${b.guest_name}</b> — ${b.check_in} → ${b.check_out} (${money(Number(b.total_amount))}) [${b.status}]`
        );
        await reply(`📋 <b>Next ${data.length} Upcoming Booking${data.length === 1 ? "" : "s"}</b>\n\n${lines.join("\n")}`);
      }
    } else if (cmd === "/revenue") {
      // Same definition as the admin Overview "Revenue (GH₵)" stat card:
      // all-time total across confirmed bookings.
      const { data } = await supabase.from("bookings").select("total_amount").eq("status", "confirmed");

      const total = (data || []).reduce((sum, b) => sum + Number(b.total_amount), 0);
      await reply(
        `💰 <b>Revenue</b>\n\n${data?.length || 0} confirmed booking${data?.length === 1 ? "" : "s"}\n` +
        `Total: <b>${money(total)}</b>\n\n<i>Matches the admin Overview stat card.</i>`
      );
    } else if (cmd === "/help" || cmd === "/start") {
      await reply(`🤖 <b>Diz Eden Bot</b>\n\n${COMMANDS.map((c) => `/${c.command} — ${c.description}`).join("\n")}`);
    } else {
      await reply("Unknown command. Try /help.");
    }
  } catch {
    // Never let a query error surface Postgres/internal details to Telegram
    await reply("⚠️ Something went wrong running that command.").catch(() => {});
  }

  return new Response("ok", { headers: corsHeaders });
});
