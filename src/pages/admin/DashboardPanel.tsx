import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CalendarCheck, Users, Star, TrendingUp } from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const revenueChartConfig = {
  revenue: { label: "Revenue (GH₵)", color: "hsl(var(--color-gold))" },
} satisfies ChartConfig;

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

  // Revenue by stay date (check-in), confirmed bookings only
  const revenueByDate = confirmed.reduce((acc, b) => {
    acc[b.check_in] = (acc[b.check_in] || 0) + b.total_amount;
    return acc;
  }, {} as Record<string, number>);
  const revenueChartData = Object.entries(revenueByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date: format(new Date(date), "MMM d"), revenue }));

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

      {/* Revenue trend */}
      <div>
        <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Revenue Trend</h3>
        {revenueChartData.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-10 text-center">
            <p className="text-cream/30 text-sm">No confirmed bookings yet — the chart fills in as revenue comes in.</p>
          </div>
        ) : (
          <Card className="bg-white/[0.03] border-white/5">
            <CardContent className="pt-6">
              <ChartContainer config={revenueChartConfig} className="h-64 w-full">
                <LineChart data={revenueChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 8" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickMargin={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `₵${value.toLocaleString()}`}
                    width={56}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="dot" />}
                    cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "3 3" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--color-revenue)" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
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
