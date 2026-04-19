import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, X, Ban } from "lucide-react";

type BlockedDate = {
  id: string;
  date: string;
  reason: string | null;
};

type Booking = {
  check_in: string;
  check_out: string;
  guest_name: string;
  status: string | null;
};

export default function AvailabilityPanel() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: blocked }, { data: bks }] = await Promise.all([
      supabase.from("blocked_dates").select("*"),
      supabase.from("bookings").select("check_in, check_out, guest_name, status").neq("status", "cancelled"),
    ]);
    setBlockedDates((blocked as BlockedDate[]) || []);
    setBookings((bks as Booking[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const isBlocked = (date: Date) =>
    blockedDates.some((b) => isSameDay(new Date(b.date), date));

  const getBookingForDate = (date: Date) =>
    bookings.find((b) => {
      const ci = new Date(b.check_in);
      const co = new Date(b.check_out);
      return date >= ci && date < co;
    });

  const handleDayClick = (day: Date) => {
    if (isBefore(day, new Date()) && !isToday(day)) return;
    setSelectedDate(day);
  };

  const blockDate = async () => {
    if (!selectedDate) return;
    setBlocking(true);
    await supabase.from("blocked_dates").insert({
      date: format(selectedDate, "yyyy-MM-dd"),
      reason: reason || null,
    });
    setReason("");
    setSelectedDate(null);
    await fetchData();
    setBlocking(false);
  };

  const unblockDate = async (id: string) => {
    await supabase.from("blocked_dates").delete().eq("id", id);
    await fetchData();
  };

  const startDayOfWeek = startOfMonth(currentMonth).getDay();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-light text-white">Availability</h2>
          <p className="text-cream/40 text-sm mt-1">Block dates or view booked periods</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrentMonth(addDays(startOfMonth(currentMonth), -1))} className="p-2 rounded-xl hover:bg-white/5 text-cream/60 hover:text-white transition-all">
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-white font-display text-xl">{format(currentMonth, "MMMM yyyy")}</h3>
            <button onClick={() => setCurrentMonth(addDays(endOfMonth(currentMonth), 1))} className="p-2 rounded-xl hover:bg-white/5 text-cream/60 hover:text-white transition-all">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="text-center text-[10px] uppercase tracking-widest text-cream/30 py-2">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="animate-spin text-gold" size={24} />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day) => {
                const blocked = isBlocked(day);
                const booking = getBookingForDate(day);
                const past = isBefore(day, new Date()) && !isToday(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <button
                    key={day.toString()}
                    onClick={() => handleDayClick(day)}
                    disabled={past}
                    className={`
                      aspect-square rounded-xl text-sm font-medium transition-all flex flex-col items-center justify-center gap-0.5
                      ${past ? "opacity-20 cursor-not-allowed" : "cursor-pointer"}
                      ${isSelected ? "ring-2 ring-gold bg-gold/20 text-white" : ""}
                      ${blocked && !isSelected ? "bg-red-500/20 text-red-400 border border-red-500/30" : ""}
                      ${booking && !blocked && !isSelected ? "bg-green-500/10 text-green-400 border border-green-500/20" : ""}
                      ${!blocked && !booking && !isSelected && !past ? "text-cream/70 hover:bg-white/5 hover:text-white" : ""}
                      ${isToday(day) && !isSelected ? "ring-1 ring-gold/40" : ""}
                    `}
                  >
                    <span>{format(day, "d")}</span>
                    {booking && (
                      <span className="text-[8px] leading-none opacity-70 hidden sm:block truncate max-w-full px-1">
                        {booking.guest_name?.split(" ")[0]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-5 mt-6 pt-5 border-t border-white/5">
            {[
              { color: "bg-green-500/20 border-green-500/30", label: "Booked" },
              { color: "bg-red-500/20 border-red-500/30", label: "Blocked" },
              { color: "ring-1 ring-gold/40", label: "Today" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${color} border`} />
                <span className="text-cream/40 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-6">
          {/* Block date form */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-1">
              {selectedDate ? `Block ${format(selectedDate, "dd MMM yyyy")}` : "Select a date to block"}
            </h3>
            <p className="text-cream/40 text-xs mb-4">Click any available date on the calendar</p>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (e.g. Maintenance)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 mb-3"
            />
            <button
              onClick={blockDate}
              disabled={!selectedDate || blocking}
              className="w-full bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-red-500/30 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {blocking ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
              Block This Date
            </button>
          </div>

          {/* Blocked dates list */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Blocked Dates ({blockedDates.length})</h3>
            {blockedDates.length === 0 ? (
              <p className="text-cream/30 text-sm">No dates blocked.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {blockedDates
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((bd) => (
                    <div key={bd.id} className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                      <div>
                        <p className="text-red-300 text-sm font-medium">
                          {format(new Date(bd.date), "EEE, dd MMM yyyy")}
                        </p>
                        {bd.reason && <p className="text-red-400/50 text-xs mt-0.5">{bd.reason}</p>}
                      </div>
                      <button
                        onClick={() => unblockDate(bd.id)}
                        className="text-red-400/50 hover:text-red-400 transition-colors p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
