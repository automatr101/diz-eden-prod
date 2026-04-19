import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CalendarCheck, Users, Star, TrendingUp } from "lucide-react";
import { format, subDays, isAfter } from "date-fns";

type Booking = {
  id: string;
  total_amount: number;
  status: string | null;
  created_at: string | null;
  check_in: string;
  guest_name: string;
};

export default function DashboardPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: bks }, { count }] = await Promise.all([
        supabase.from("bookings").select("id, total_amount, status, created_at, check_in, guest_name").order("created_at", { ascending: false }),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
      ]);
      setBookings((bks as Booking[]) || []);
      setReviewCount(count || 0);
      setLoading(false);
    };
    fetchData();
  }, []);

  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const totalRevenue = confirmed.reduce((sum, b) => sum + b.total_amount, 0);
  const recentBookings = bookings.slice(0, 5);
  const thisWeek = bookings.filter((b) => b.created_at && isAfter(new Date(b.created_at), subDays(new Date(), 7)));

  const stats = [
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: CalendarCheck,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Confirmed Stays",
      value: confirmed.length,
      icon: Users,
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
    },
    {
      label: "Revenue (GH₵)",
      value: `${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-gold",
      bg: "bg-gold/10 border-gold/20",
    },
    {
      label: "Total Reviews",
      value: reviewCount,
      icon: Star,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-light text-white">Overview</h2>
        <p className="text-cream/40 text-sm mt-1">
          {thisWeek.length} new booking{thisWeek.length !== 1 ? "s" : ""} this week
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`border rounded-2xl p-5 ${bg}`}>
            <div className="flex items-start justify-between mb-3">
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-display font-light text-white">{value}</p>
            <p className="text-[10px] uppercase tracking-widest text-cream/40 mt-1 font-bold">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div>
        <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Recent Reservations</h3>
        {recentBookings.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-10 text-center">
            <p className="text-cream/30 text-sm">No bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentBookings.map((b) => (
              <div key={b.id} className="bg-white/[0.03] border border-white/5 rounded-xl px-5 py-4 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-white font-medium">{b.guest_name}</p>
                  <p className="text-cream/40 text-xs mt-0.5">
                    Check-in: {format(new Date(b.check_in), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-display">GH₵{b.total_amount.toLocaleString()}</span>
                  <span
                    className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
                      b.status === "confirmed"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : b.status === "cancelled"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    }`}
                  >
                    {b.status || "pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
