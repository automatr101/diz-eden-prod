// ─── SECURITY: Telegram notifications routed through server-side proxy ───────
// The bot token is stored as a Supabase secret, NEVER in client code.
// We call our own Edge Function which holds the token privately.

import { supabase } from "@/integrations/supabase/client";
import { toIntlPhone } from "@/lib/phone";

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

type TelegramButton = { text: string; url: string };

export async function sendTelegramNotification(message: string, buttons?: TelegramButton[]): Promise<void> {
  try {
    await supabase.functions.invoke("send-telegram", {
      body: { message, buttons },
    });
  } catch (err) {
    // Silently fail — never leak error details to browser console in production
    if (import.meta.env.DEV) {
      console.warn("Telegram notification failed:", err);
    }
  }
}

// Same wa.me deep-link pattern as the "Message Guest" button in the admin
// Bookings panel — tapping it on a phone opens WhatsApp with the guest's
// number and this text already loaded, ready to send.
function whatsappButton(guestName: string, guestPhone: string): TelegramButton | undefined {
  const phone = toIntlPhone(guestPhone || "");
  if (!phone) return undefined;
  const msg = `Hi ${guestName}! Diz Eden here. Thanks for your booking — looking forward to hosting you!`;
  return {
    text: "💬 WhatsApp Guest",
    url: `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`,
  };
}

// t.me/+<number> opens Telegram's "start chat" flow for that phone number —
// only works if the guest has a Telegram account with a matching number and
// hasn't hidden it in privacy settings, so this is a best-effort fallback
// alongside WhatsApp, not a guaranteed channel. No prefilled-text support
// for this link type (Telegram doesn't offer one for phone-number deep links).
function telegramButton(guestPhone: string): TelegramButton | undefined {
  const phone = toIntlPhone(guestPhone || "");
  if (!phone) return undefined;
  return {
    text: "✈️ Find Guest on Telegram",
    url: `https://t.me/+${phone}`,
  };
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
      `✅ Payment confirmed via Paystack`,
      [whatsappButton(data.guestName, data.guestPhone), telegramButton(data.guestPhone)].filter(
        (b): b is TelegramButton => !!b
      )
    ),

  // Fires from the WhatsApp booking flow (Booking.tsx) — this is a heads-up
  // only, not a booking notification. No database record is created by this
  // flow at all (deliberate — see PROJECT_STATE.md): the guest is about to
  // message the host directly on WhatsApp, and nothing is booked or held
  // until the host manually logs it in the admin dashboard after collecting
  // payment (BookingsPanel's "Log Booking" modal, which blocks the dates as
  // part of that action).
  whatsappLead: (data: {
    guestName: string;
    guestPhone: string;
    bedrooms: number;
    checkIn: string;
    checkOut: string;
    nights: number;
    total: number;
  }) =>
    sendTelegramNotification(
      `💬 <b>WhatsApp Booking Lead — Diz Eden</b>\n\n` +
      `👤 <b>Guest:</b> ${sanitize(data.guestName)}\n` +
      `📞 <b>Phone:</b> ${sanitize(data.guestPhone)}\n` +
      `🛏 <b>Option:</b> ${data.bedrooms}-Bedroom Stay\n` +
      `📅 <b>Check-in:</b> ${sanitize(data.checkIn)}\n` +
      `📅 <b>Check-out:</b> ${sanitize(data.checkOut)}\n` +
      `🌙 <b>Nights:</b> ${data.nights}\n` +
      `💰 <b>Total:</b> GH₵${data.total.toLocaleString()}\n\n` +
      `<i>They're about to message you on WhatsApp to book — nothing is reserved yet. Once you collect payment, log the booking in the admin dashboard to block these dates.</i>`,
      [whatsappButton(data.guestName, data.guestPhone), telegramButton(data.guestPhone)].filter(
        (b): b is TelegramButton => !!b
      )
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
