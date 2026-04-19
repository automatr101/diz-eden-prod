// ─── SECURITY: Telegram notifications routed through server-side proxy ───────
// The bot token is stored as a Supabase secret, NEVER in client code.
// We call our own Edge Function which holds the token privately.

import { supabase } from "@/integrations/supabase/client";

/**
 * Sanitize user-supplied strings before embedding them in HTML messages.
 * Prevents HTML/script injection into Telegram messages.
 */
function sanitize(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendTelegramNotification(message: string): Promise<void> {
  try {
    await supabase.functions.invoke("send-telegram", {
      body: { message },
    });
  } catch (err) {
    // Silently fail — never leak error details to browser console in production
    if (import.meta.env.DEV) {
      console.warn("Telegram notification failed:", err);
    }
  }
}

export const tg = {
  newBooking: (data: {
    guestName: string;
    guestPhone: string;
    bedrooms: number;
    checkIn: string;
    checkOut: string;
    nights: number;
    total: number;
    ref: string;
  }) =>
    sendTelegramNotification(
      `🏠 <b>New Booking — Diz Eden</b>\n\n` +
      `👤 <b>Guest:</b> ${sanitize(data.guestName)}\n` +
      `📞 <b>Phone:</b> ${sanitize(data.guestPhone)}\n` +
      `🛏 <b>Option:</b> ${data.bedrooms}-Bedroom Stay\n` +
      `📅 <b>Check-in:</b> ${sanitize(data.checkIn)}\n` +
      `📅 <b>Check-out:</b> ${sanitize(data.checkOut)}\n` +
      `🌙 <b>Nights:</b> ${data.nights}\n` +
      `💰 <b>Total:</b> GH₵${data.total.toLocaleString()}\n` +
      `🔖 <b>Ref:</b> ${sanitize(data.ref)}\n\n` +
      `✅ Payment confirmed via Paystack`
    ),

  newContactForm: (data: { name: string; phone: string; message: string }) =>
    sendTelegramNotification(
      `📩 <b>New Inquiry — Diz Eden</b>\n\n` +
      `👤 <b>Name:</b> ${sanitize(data.name)}\n` +
      `📞 <b>Phone:</b> ${sanitize(data.phone)}\n` +
      `💬 <b>Message:</b> ${sanitize(data.message)}`
    ),

  availabilityCheck: (data: { checkIn: string; checkOut: string; guests: number }) =>
    sendTelegramNotification(
      `🔍 <b>Availability Check — Diz Eden</b>\n\n` +
      `📅 <b>Check-in:</b> ${sanitize(data.checkIn)}\n` +
      `📅 <b>Check-out:</b> ${sanitize(data.checkOut)}\n` +
      `👥 <b>Guests:</b> ${data.guests}\n\n` +
      `⚡ Someone is checking availability — they may book soon!`
    ),

  bookingStarted: (data: { guestName: string; total: number; ref: string }) =>
    sendTelegramNotification(
      `🟡 <b>Booking Initiated</b>\n\n` +
      `👤 <b>Guest:</b> ${sanitize(data.guestName)}\n` +
      `💰 <b>Amount:</b> GH₵${data.total.toLocaleString()}\n` +
      `🔖 <b>Ref:</b> ${sanitize(data.ref)}\n\n` +
      `⏳ <i>User is currently on the Paystack checkout screen...</i>`
    ),

  paymentFailed: (data: { guestName: string; ref: string }) =>
    sendTelegramNotification(
      `❌ <b>Payment Window Closed/Failed</b>\n\n` +
      `👤 <b>Guest:</b> ${sanitize(data.guestName)}\n` +
      `🔖 <b>Ref:</b> ${sanitize(data.ref)}\n\n` +
      `⚠️ <i>The user closed the payment window without completing the transaction.</i>`
    ),
};
