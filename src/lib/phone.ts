// Guests mostly enter Ghana numbers in local format (e.g. "0545266202").
// WhatsApp/Telegram deep links need full international format with no
// leading zero (e.g. "233545266202"), or they silently fail to resolve.
export function toIntlPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) {
    return `233${digits.slice(1)}`;
  }
  return digits;
}
