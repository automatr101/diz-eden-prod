import { useState, useEffect } from "react";
import { CalendarDays, Users } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { tg } from "@/lib/telegram";

// Loading state for booking action
const useLoading = () => {
  const [loading, setLoading] = useState(false);
  const start = () => setLoading(true);
  const stop = () => setLoading(false);
  return { loading, start, stop };
};

export default function BookingBar() {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("2");
  const navigate = useNavigate();
  const { loading, start, stop } = useLoading();

  // Automatically notify host when dates change
  useEffect(() => {
    if (checkIn && checkOut) {
      tg.availabilityCheck({
        checkIn: format(checkIn, "dd MMM yyyy"),
        checkOut: format(checkOut, "dd MMM yyyy"),
        guests: Number(guests),
      });
    }
  }, [checkIn, checkOut, guests]);

  const handleCheckAvailability = () => {
    // Prevent multiple clicks
    if (loading) return;
    start();

    // Build URL params and go to booking page
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", format(checkIn, "yyyy-MM-dd"));
    if (checkOut) params.set("checkOut", format(checkOut, "yyyy-MM-dd"));
    params.set("guests", guests);

    navigate(`/booking?${params.toString()}`);
    stop();
  };

  return (
    <motion.section
      id="booking-bar"
      {...fadeInUp}
      transition={{ ...fadeInUp.transition, delay: 0.6 }}
      className="relative z-20 px-4 md:px-8 mt-[-30px] md:mt-[-50px]"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-2 md:grid md:grid-cols-4 md:items-center bg-white/[0.04] backdrop-blur-xl border border-white/10 p-2 md:p-3 md:rounded-full rounded-3xl shadow-2xl shadow-black/50">

        {/* Check-in */}
        <div className="flex-1 bg-white/[0.02] hover:bg-white/[0.06] rounded-2xl md:rounded-full transition-colors px-6 py-4">
          <span className="text-label-sm text-gold font-bold tracking-widest uppercase mb-2 block">Check-in</span>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-3 w-full text-left outline-none group">
                <CalendarDays size={18} className="text-gold group-hover:scale-110 transition-transform" />
                <span className={cn("font-display text-xl transition-colors", checkIn ? "text-white" : "text-cream/40")}>
                  {checkIn ? format(checkIn, "dd MMM yyyy") : "Select date"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-eden border-white/10" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                disabled={{ before: new Date() }}
                initialFocus
                className="text-white"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out */}
        <div className="flex-1 bg-white/[0.02] hover:bg-white/[0.06] rounded-2xl md:rounded-full transition-colors px-6 py-4">
          <span className="text-label-sm text-gold font-bold tracking-widest uppercase mb-2 block">Check-out</span>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-3 w-full text-left outline-none group">
                <CalendarDays size={18} className="text-gold group-hover:scale-110 transition-transform" />
                <span className={cn("font-display text-xl transition-colors", checkOut ? "text-white" : "text-cream/40")}>
                  {checkOut ? format(checkOut, "dd MMM yyyy") : "Select date"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-eden border-white/10" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={{ before: checkIn ? new Date(checkIn.getTime() + 86400000) : new Date() }}
                initialFocus
                className="text-white"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div className="flex-1 bg-white/[0.02] hover:bg-white/[0.06] rounded-2xl md:rounded-full transition-colors px-6 py-4">
          <span className="text-label-sm text-gold font-bold tracking-widest uppercase mb-2 block">Guests</span>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="bg-transparent border-none p-0 h-auto text-xl font-display text-white focus:ring-0 shadow-none ring-0 w-full flex items-center gap-3">
              <div className="flex items-center gap-3">
                <Users size={18} className="text-gold group-hover:scale-110 transition-transform" />
                <SelectValue placeholder="Guests" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-eden border-white/10 text-white">
              {[1, 2, 3, 4].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} Guest{n > 1 ? "s" : ""}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* CTA */}
        <div className="flex items-center pt-2 md:pt-0">
          <button
            onClick={handleCheckAvailability}
            disabled={!checkIn || !checkOut || loading}
            className={`w-full h-full min-h-[64px] bg-gold text-eden text-label-sm font-bold tracking-[0.2em] uppercase transition-all duration-500 rounded-2xl md:rounded-full flex items-center justify-center ${
              (!checkIn || !checkOut || loading) ? "opacity-50 cursor-not-allowed" : "hover:bg-white hover:scale-[1.02] active:scale-95 shadow-[0_10px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_30px_rgba(255,255,255,0.4)]"
            }`}
          >
            {loading ? "Processing…" : "Search"}
          </button>
        </div>
      </div>
    </motion.section>
  );
}
