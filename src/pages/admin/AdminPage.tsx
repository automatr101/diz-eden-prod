import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CalendarDays, BookOpen, Star, DollarSign, LogOut, Menu, X,
} from "lucide-react";
import logoImg from "@/assets/diz-eden-logo.jpg";
import AdminLogin from "./AdminLogin";
import DashboardPanel from "./DashboardPanel";
import BookingsPanel from "./BookingsPanel";
import AvailabilityPanel from "./AvailabilityPanel";
import PricingPanel from "./PricingPanel";
import ReviewsPanel from "./ReviewsPanel";
import { cn } from "@/lib/utils";

type Panel = "dashboard" | "bookings" | "availability" | "pricing" | "reviews";

const navItems: { id: Panel; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: BookOpen },
  { id: "availability", label: "Availability", icon: CalendarDays },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "reviews", label: "Reviews", icon: Star },
];

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Panel>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1f14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AdminLogin onLogin={() => {}} />;
  }

  const PANELS: Record<Panel, React.ReactNode> = {
    dashboard: <DashboardPanel />,
    bookings: <BookingsPanel />,
    availability: <AvailabilityPanel />,
    pricing: <PricingPanel />,
    reviews: <ReviewsPanel />,
  };

  return (
    <div className="min-h-screen bg-[#071510] flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0a1f14] border-r border-white/5 fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
          <div className="p-0.5 rounded-full border border-gold/30">
            <img src={logoImg} alt="Diz Eden" className="w-10 h-10 rounded-full object-cover" />
          </div>
          <div>
            <p className="text-white font-display text-sm tracking-wide">Diz Eden</p>
            <p className="text-gold/60 text-[10px] uppercase tracking-widest">Admin Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                active === id
                  ? "bg-gold/20 text-gold border border-gold/20"
                  : "text-cream/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-6 border-t border-white/5">
          <div className="px-4 py-2 mb-3">
            <p className="text-cream/30 text-xs truncate">{session.user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#0a1f14] border-r border-white/5 z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <img src={logoImg} alt="Diz Eden" className="w-9 h-9 rounded-full object-cover border border-gold/30" />
                  <p className="text-white font-display text-sm">Admin Portal</p>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-cream/50 hover:text-white p-2">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-6 space-y-1">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => { setActive(id); setMobileOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                      active === id
                        ? "bg-gold/20 text-gold border border-gold/20"
                        : "text-cream/50 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon size={16} /> {label}
                  </button>
                ))}
              </nav>
              <div className="px-3 py-6 border-t border-white/5">
                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/10">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="bg-[#0a1f14]/80 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-cream/60 hover:text-white p-1"
          >
            <Menu size={22} />
          </button>
          <div>
            <h1 className="text-white font-semibold text-sm capitalize">
              {navItems.find((n) => n.id === active)?.label}
            </h1>
            <p className="text-cream/30 text-xs">Diz Eden Management</p>
          </div>
          <div className="ml-auto">
            <a
              href="/"
              target="_blank"
              className="text-[10px] uppercase tracking-widest text-gold/60 hover:text-gold border border-gold/20 hover:border-gold/40 px-4 py-2 rounded-xl transition-all"
            >
              View Site →
            </a>
          </div>
        </header>

        {/* Panel content */}
        <main className="flex-1 p-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {PANELS[active]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
