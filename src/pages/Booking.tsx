import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format, differenceInCalendarDays, addDays, isBefore } from "date-fns";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { tg } from "@/lib/telegram";
import { emailApi } from "@/lib/emails";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BedDouble, Users, CalendarDays, CheckCircle2, Loader2, Shield, CalendarIcon } from "lucide-react";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";
import { useAvailability } from "@/hooks/useAvailability";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number; // in kobo (pesewas for GHS)
        currency: string;
        ref: string;
        metadata?: Record<string, unknown>;
        onClose: () => void;
        callback: (response: { reference: string; status: string }) => void;
      }) => { openIframe: () => void };
    };
  }
}

import { apartment } from "@/lib/properties";

type Step = "details" | "payment" | "confirmed";

// ─── SECURITY: Input sanitization ────────────────────────────────────────────
function sanitizeInput(str: string): string {
  return str.replace(/[<>"'`;(){}]/g, "").trim();
}

// ─── SECURITY: Rate limiter — prevents spam submissions ─────────────────────
const RATE_LIMIT_MS = 10_000; // 10 seconds between submissions
let lastSubmissionTime = 0;

export default function Booking() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // Pre-fill from BookingBar URL params
  const initCheckIn = params.get("checkIn") || "";
  const initCheckOut = params.get("checkOut") || "";
  const initGuests = Number(params.get("guests") || 1);
  const [step, setStep] = useState<Step>("details");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: initCheckIn ? new Date(initCheckIn) : undefined,
    to: initCheckOut ? new Date(initCheckOut) : undefined,
  });

  const checkIn = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
  const checkOut = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";

  const { data: unavailableDates = [] } = useAvailability();

  const [guests, setGuests] = useState(initGuests);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paying, setPaying] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");

  const [basePrice, setBasePrice] = useState(apartment.basePrice);

  const nights = checkIn && checkOut
    ? Math.max(0, differenceInCalendarDays(new Date(checkOut), new Date(checkIn)))
    : 0;
  const totalGHS = nights * basePrice;
  const totalPesewas = Math.round(totalGHS * 100);

  // Check availability against blocked_dates and existing bookings
  const checkAvailability = async (): Promise<boolean> => {
    if (!checkIn || !checkOut || nights < 1) return false;

    setAvailabilityError("");

    // 1. Generate list of dates guest will actually spend the night
    const checkInRange: string[] = [];
    const d = new Date(dateRange!.from!);
    for (let i = 0; i < nights; i++) {
      checkInRange.push(format(d, "yyyy-MM-dd"));
      d.setDate(d.getDate() + 1);
    }

    console.log("Checking availability for nights:", checkInRange);

    const [blockedRes, existingRes] = await Promise.all([
      supabase.from("blocked_dates").select("date").in("date", checkInRange),
      supabase.from("bookings")
        .select("check_in, check_out")
        .neq("status", "cancelled")
        .lt("check_in", checkOut)
        .gt("check_out", checkIn),
    ]);

    if (blockedRes.error || existingRes.error) {
      console.error("Availability query failed:", blockedRes.error || existingRes.error);
      return false;
    }

    const isBlocked = blockedRes.data && blockedRes.data.length > 0;
    const isBooked = existingRes.data && existingRes.data.length > 0;

    if (isBlocked) {
      console.log("Found blocked dates:", blockedRes.data);
      setAvailabilityError("Some dates in your selection are blocked. Please choose different dates.");
      return false;
    }
    if (isBooked) {
      console.log("Found overlapping bookings:", existingRes.data);
      setAvailabilityError("These dates overlap with an existing booking. Please choose different dates.");
      return false;
    }

    console.log("Dates are available!");
    setAvailabilityError("");
    return true;
  };

  useEffect(() => {
    async function fetchPricing() {
      const { data } = await supabase.from('settings').select('*').eq('key', 'nightly_rate').single();
      if (data && data.value) {
        setBasePrice(Number(data.value));
      }
    }
    fetchPricing();
  }, []);

  // Real-time availability check
  useEffect(() => {
    setAvailabilityError(""); // Reset error immediately when dates change
    if (checkIn && checkOut && nights >= 1) {
      checkAvailability();
    }
  }, [checkIn, checkOut, nights]);

  useEffect(() => {
    // If arrived with dates pre-filled, scroll to details to save user a gesture
    if (initCheckIn && initCheckOut && step === "details") {
      const timer = setTimeout(() => {
        const details = document.getElementById("guest-details");
        if (details) details.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [initCheckIn, initCheckOut]);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim() || !form.email.includes("@")) errs.email = "Valid email required";
    if (!form.phone.trim() || form.phone.length < 9) errs.phone = "Valid phone number required";
    if (!checkIn) errs.checkIn = "Check-in date required";
    if (!checkOut) errs.checkOut = "Check-out date required";
    if (nights < 1) errs.dates = "Check-out must be after check-in";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (!validateForm()) {
      // Find the first error element and scroll to it
      const firstError = document.querySelector(".border-red-500, .bg-red-500\\/10");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        window.scrollTo({ top: 150, behavior: "smooth" });
      }
      return;
    }

    // ── SECURITY: Rate limit check ──
    const now = Date.now();
    if (now - lastSubmissionTime < RATE_LIMIT_MS) {
      alert("Please wait a few seconds before trying again.");
      return;
    }
    lastSubmissionTime = now;

    // ── SECURITY: Sanitize inputs before processing ──
    const sanitizedForm = {
      name: sanitizeInput(form.name),
      email: sanitizeInput(form.email),
      phone: sanitizeInput(form.phone),
      notes: sanitizeInput(form.notes),
    };
    setForm(sanitizedForm);

    // ── SECURITY: Amount integrity check ──
    if (totalPesewas <= 0 || totalPesewas > 100_000_00 || !Number.isInteger(totalPesewas)) {
      alert("Invalid booking amount detected. Please refresh and try again.");
      return;
    }

    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) {
      alert("System Configuration Error: Paystack Public Key is missing. Please check your .env file and restart the development server (npm run dev).");
      return;
    }

    setPaying(true);
    const available = await checkAvailability();

    if (!available) {
      setPaying(false);
      return;
    }

    setStep("payment");
    // Small delay then launch Paystack
    setTimeout(() => launchPaystack(paystackKey), 300);
  };

  const launchPaystack = (paystackKey: string) => {
    if (!window.PaystackPop) {
      alert("Payment system not loaded. Please disable your adblocker and refresh.");
      setPaying(false);
      return;
    }

    const ref = `DE-${Date.now().toString(36).toUpperCase()}`;

    try {
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: form.email,
        amount: totalPesewas,
        currency: "GHS",
        ref: ref,
        metadata: {
          custom_fields: [
            { display_name: "Guest Name", variable_name: "guest_name", value: form.name },
            { display_name: "Phone", variable_name: "phone", value: form.phone },
            { display_name: "Property", variable_name: "property", value: apartment.name },
            { display_name: "Check-in", variable_name: "check_in", value: checkIn },
            { display_name: "Check-out", variable_name: "check_out", value: checkOut },
          ],
        },
        callback: (response: any) => {
          handlePaymentSuccess(response.reference, ref).catch(console.error);
        },
        onClose: () => {
          setPaying(false);
          setStep("details");
        },
      });

      handler.openIframe();
      tg.bookingStarted({ guestName: form.name, total: totalPesewas / 100, ref }).catch(console.error);
    } catch (err: any) {
      console.error("Paystack Error:", err);
      alert("Payment window failed to open. Please try again.");
      setPaying(false);
    }
  };

  const handlePaymentSuccess = async (paystackRef: string, internalRef: string) => {
    setPaying(true);

    // 1. Save booking to Supabase as PENDING (with sanitized inputs)
    const { error } = await supabase.from("bookings").insert({
      booking_reference: internalRef,
      guest_name: sanitizeInput(form.name),
      guest_email: sanitizeInput(form.email),
      guest_phone: sanitizeInput(form.phone),
      check_in: checkIn,
      check_out: checkOut,
      num_guests: guests,
      num_nights: nights,
      nightly_rate: basePrice,
      total_amount: totalGHS,
      currency: "GHS",
      status: "pending", // ── SECURITY: Start as pending until server verifies ──
      special_requests: form.notes || null,
      stripe_payment_id: paystackRef,
    });

    if (error) {
      console.error("Failed to save booking:", error);
    }

    // 2. ── SECURITY: Server-side payment verification ──
    try {
      const { data: verifyResult } = await supabase.functions.invoke("verify-payment", {
        body: {
          reference: paystackRef,
          expectedAmount: totalGHS,
          bookingRef: internalRef,
        },
      });

      if (!verifyResult?.verified) {
        console.warn("Server verification flagged this payment:", verifyResult);
        // The Edge Function already flagged the booking in the DB
      }
    } catch (verifyErr) {
      // If verification service is unavailable, the booking stays as "pending"
      // for manual admin review — fail-safe, not fail-open
      if (import.meta.env.DEV) {
        console.warn("Payment verification service unavailable:", verifyErr);
      }
    }

    // 2. Block the dates
    const datesToBlock = [];
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    for (let d = new Date(start); isBefore(d, end); d = addDays(d, 1)) {
      datesToBlock.push({ date: format(d, "yyyy-MM-dd"), reason: `Booked: ${internalRef}` });
    }
    if (datesToBlock.length > 0) {
      await supabase.from("blocked_dates").insert(datesToBlock);
    }

    // 3. Send Telegram notification
    await tg.newBooking({
      guestName: form.name,
      guestPhone: form.phone,
      bedrooms: apartment.bedrooms,
      checkIn: format(new Date(checkIn), "dd MMM yyyy"),
      checkOut: format(new Date(checkOut), "dd MMM yyyy"),
      nights,
      total: totalGHS,
      ref: internalRef,
    });

    // Send the beautiful Email confirmation to the guest instantly!
    emailApi.sendConfirmation({
      to: form.email,
      name: form.name,
      bookingRef: internalRef,
      checkIn: format(new Date(checkIn), "dd MMM yyyy"),
      checkOut: format(new Date(checkOut), "dd MMM yyyy"),
      propertyName: apartment.name,
    });

    setBookingRef(internalRef);
    setStep("confirmed");
    setPaying(false);
  };

  // ─── Confirmed screen ───────────────────────────────────────────────
  if (step === "confirmed") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-eden flex items-center justify-center px-6 pt-28 pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={40} className="text-green-400" />
            </div>
            <h1 className="text-4xl font-display font-light text-white mb-3">
              Booking <em className="italic text-gold">Confirmed</em>
            </h1>
            <p className="text-cream/60 mb-6">
              Thank you, <strong className="text-white">{form.name}</strong>! Your stay at Diz Eden is reserved.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-cream/50">Reference</span>
                <span className="text-gold font-mono font-bold">{bookingRef}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cream/50">Property</span>
                <span className="text-white">{apartment.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cream/50">Check-in</span>
                <span className="text-white">{format(new Date(checkIn), "dd MMM yyyy")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cream/50">Check-out</span>
                <span className="text-white">{format(new Date(checkOut), "dd MMM yyyy")}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/10 pt-3">
                <span className="text-cream/50">Total Paid</span>
                <span className="text-white font-display text-lg">GH₵{totalGHS.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-cream/40 text-sm mb-6">
              A confirmation will be sent to <span className="text-cream/70">{form.email}</span>.
              Our concierge will also reach out on WhatsApp at <span className="text-cream/70">{form.phone}</span>.
            </p>
            <a
              href="/"
              className="inline-block bg-gold text-eden font-bold text-[10px] sm:text-xs uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-4 rounded-full hover:bg-white transition-all shadow-lg shadow-gold/20"
            >
              Back to Diz Eden
            </a>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  // ─── Main booking form ───────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-eden pt-48 pb-20 px-6 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <span className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold">Direct Booking</span>
            <h1 className="text-4xl md:text-5xl font-display font-light text-white mt-3">
              Reserve Your <em className="italic text-gold">Stay</em>
            </h1>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
            {/* Left: Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-8"
            >
              {/* Room Selection Removed */}

              {/* Dates & Guests */}
              <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-7">
                <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                  <CalendarDays size={18} className="text-gold" />
                  Your Dates
                </h2>

                <div className="grid sm:grid-cols-2 mb-6 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button className={`p-4 text-left hover:bg-white/[0.05] transition-colors border-b sm:border-b-0 sm:border-r border-white/10 ${errors.checkIn ? "bg-red-500/10" : ""}`}>
                        <span className="text-[10px] uppercase tracking-widest text-gold font-bold block">Check-in</span>
                        <div className="mt-1 flex items-center gap-2 text-white text-sm">
                          <CalendarIcon size={14} className="text-white/40" />
                          {dateRange?.from ? format(dateRange.from, "MMM d, yyyy") : "Select date"}
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-eden border-white/10 rounded-2xl shadow-2xl drop-shadow-2xl" align="start">
                      <AvailabilityCalendar
                        unavailableDates={unavailableDates}
                        selected={dateRange}
                        onSelect={(range) => {
                          setDateRange(range);
                          setAvailabilityError("");
                          setErrors(e => ({ ...e, checkIn: "", checkOut: "", dates: "" }));
                          if (range?.from && range?.to) setCalendarOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <button
                    className={`p-4 text-left hover:bg-white/[0.05] transition-colors ${errors.checkOut ? "bg-red-500/10" : ""}`}
                    onClick={() => setCalendarOpen(true)}
                  >
                    <span className="text-[10px] uppercase tracking-widest text-gold font-bold block">Check-out</span>
                    <div className="mt-1 flex items-center gap-2 text-white text-sm">
                      <CalendarIcon size={14} className="text-white/40" />
                      {dateRange?.to ? format(dateRange.to, "MMM d, yyyy") : "Select date"}
                    </div>
                  </button>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-2">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 transition-all cursor-pointer"
                  >
                    {Array.from({ length: apartment.maxGuests }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n} className="bg-[#0a1f14]">
                        {n} Guest{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                {availabilityError && (
                  <p className="mt-3 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                    {availabilityError}
                  </p>
                )}
                {errors.dates && <p className="mt-2 text-red-400 text-xs">{errors.dates}</p>}
              </div>

              {/* Guest Details */}
              <div id="guest-details" className="bg-white/[0.03] border border-white/5 rounded-3xl p-7 scroll-mt-24">
                <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                  <Users size={18} className="text-gold" />
                  Your Details
                </h2>
                <div className="space-y-4">
                  {[
                    { key: "name", label: "Full Name", placeholder: "Kwame Mensah", type: "text" },
                    { key: "email", label: "Email Address", placeholder: "you@email.com", type: "email" },
                    { key: "phone", label: "Phone / WhatsApp", placeholder: "+233 XX XXX XXXX", type: "tel" },
                  ].map(({ key, label, placeholder, type }) => (
                    <div key={key}>
                      <label className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-2">
                        {label}
                      </label>
                      <input
                        type={type}
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-all ${errors[key] ? "border-red-500/50" : "border-white/10"}`}
                      />
                      {errors[key] && <p className="mt-1 text-red-400 text-xs">{errors[key]}</p>}
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      rows={2}
                      placeholder="Early check-in, dietary needs, etc."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Summary + Pay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:sticky lg:top-28 space-y-4"
            >
              <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-7">
                <h3 className="text-white font-semibold mb-5">Booking Summary</h3>

                <img
                  src={apartment.image}
                  alt={apartment.name}
                  className="w-full h-40 object-cover rounded-2xl mb-5 border border-white/5"
                />

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-cream/50">Diz Eden Stay</span>
                    <span className="text-white">{guests} guest{guests > 1 ? "s" : ""}</span>
                  </div>
                  {checkIn && checkOut && nights > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-cream/50">Dates</span>
                        <span className="text-white text-right">
                          {format(new Date(checkIn), "dd MMM")} → {format(new Date(checkOut), "dd MMM yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cream/50">
                          GH₵{apartment.basePrice.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}
                        </span>
                        <span className="text-white">GH₵{totalGHS.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-3">
                        <span className="text-white font-semibold">Total</span>
                        <span className="text-gold font-display text-2xl">GH₵{totalGHS.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  {(!checkIn || !checkOut || nights < 1) && (
                    <p className="text-cream/30 text-xs text-center py-2">Select dates to see total</p>
                  )}
                </div>

                <button
                  onClick={handleProceedToPayment}
                  disabled={paying || nights < 1 || !!availabilityError}
                  className="w-full bg-gold text-eden font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] py-4 sm:py-5 rounded-2xl hover:bg-white transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_15px_30px_-10px_rgba(212,175,55,0.5)]"
                >
                  {paying ? (
                    <><Loader2 size={14} className="animate-spin" /> Checking...</>
                  ) : (
                    <>Pay GH₵{totalGHS.toLocaleString() || "—"} Securely</>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-cream/30 text-xs">
                  <Shield size={12} />
                  Secured by Paystack · SSL Encrypted
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <h4 className="text-cream/50 text-[10px] uppercase tracking-widest font-bold mb-3">Cancellation Policy</h4>
                <ul className="space-y-1.5 text-cream/40 text-xs">
                  <li>• Full refund if cancelled 7+ days before check-in</li>
                  <li>• 50% refund if cancelled 3–6 days before check-in</li>
                  <li>• No refund if cancelled less than 3 days before check-in</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
