import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInCalendarDays } from "date-fns";
import { Loader2, CheckCircle2, XCircle, Clock, ExternalLink, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { emailApi } from "@/lib/emails";

type Booking = {
  id: string;
  booking_reference: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  num_guests: number;
  num_nights: number;
  nightly_rate: number;
  total_amount: number;
  status: string | null;
  special_requests: string | null;
  created_at: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  confirmed: <CheckCircle2 size={14} />,
  pending: <Clock size={14} />,
  cancelled: <XCircle size={14} />,
};

const BEDROOM_RATES: Record<string, number> = {
  "1": 1200,
  "2": 1800,
};

function LogBookingModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    guest_name: "",
    guest_phone: "",
    guest_email: "",
    check_in: "",
    check_out: "",
    num_guests: "2",
    bedrooms: "1",
    special_requests: "",
    status: "confirmed",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const nights = form.check_in && form.check_out
    ? Math.max(0, differenceInCalendarDays(new Date(form.check_out), new Date(form.check_in)))
    : 0;
  const rate = BEDROOM_RATES[form.bedrooms] || 1200;
  const total = nights * rate;

  const handleSave = async () => {
    if (!form.guest_name || !form.check_in || !form.check_out || nights < 1) {
      setError("Please fill in guest name, valid check-in and check-out dates.");
      return;
    }
    setSaving(true);
    const ref = `DE-${Date.now().toString(36).toUpperCase()}`;
    const { error: err } = await supabase.from("bookings").insert({
      booking_reference: ref,
      guest_name: form.guest_name,
      guest_email: form.guest_email || `${form.guest_name.toLowerCase().replace(/\s+/g, ".")}@guest.dizeden.com`,
      guest_phone: form.guest_phone || null,
      check_in: form.check_in,
      check_out: form.check_out,
      num_guests: parseInt(form.num_guests),
      num_nights: nights,
      nightly_rate: rate,
      total_amount: total,
      currency: "GHS",
      status: form.status,
      special_requests: form.special_requests || null,
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0d2318] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/5">
          <div>
            <h3 className="text-white font-semibold">Log WhatsApp Booking</h3>
            <p className="text-cream/40 text-xs mt-0.5">Manually record a confirmed reservation</p>
          </div>
          <button onClick={onClose} className="text-cream/40 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="px-7 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <p className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2 rounded-xl">{error}</p>
          )}

          {/* Guest Name */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-1.5">Guest Name *</label>
            <input
              value={form.guest_name}
              onChange={(e) => setForm(f => ({ ...f, guest_name: e.target.value }))}
              placeholder="e.g. Kwame Mensah"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-all"
            />
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-1.5">Phone</label>
              <input
                value={form.guest_phone}
                onChange={(e) => setForm(f => ({ ...f, guest_phone: e.target.value }))}
                placeholder="+233..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-1.5">Email</label>
              <input
                value={form.guest_email}
                onChange={(e) => setForm(f => ({ ...f, guest_email: e.target.value }))}
                placeholder="optional"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-all"
              />
            </div>
          </div>

          {/* Check-in / Check-out */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-1.5">Check-in *</label>
              <input
                type="date"
                value={form.check_in}
                onChange={(e) => setForm(f => ({ ...f, check_in: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-1.5">Check-out *</label>
              <input
                type="date"
                value={form.check_out}
                onChange={(e) => setForm(f => ({ ...f, check_out: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 transition-all"
              />
            </div>
          </div>

          {/* Bedrooms + Guests */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-1.5">Bedrooms</label>
              <select
                value={form.bedrooms}
                onChange={(e) => setForm(f => ({ ...f, bedrooms: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 transition-all"
              >
                <option value="1" className="bg-[#0d2318]">1 Bedroom — GH₵1,200/night</option>
                <option value="2" className="bg-[#0d2318]">2 Bedroom — GH₵1,800/night</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-1.5">Guests</label>
              <select
                value={form.num_guests}
                onChange={(e) => setForm(f => ({ ...f, num_guests: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 transition-all"
              >
                {[1,2,3,4].map(n => <option key={n} value={n} className="bg-[#0d2318]">{n} Guest{n > 1 ? "s" : ""}</option>)}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-1.5">Status</label>
            <div className="flex gap-2">
              {["confirmed", "pending", "cancelled"].map(s => (
                <button
                  key={s}
                  onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={cn(
                    "flex-1 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all",
                    form.status === s ? STATUS_STYLES[s] : "text-cream/30 border-white/5 hover:text-cream/60"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-1.5">Notes / Requests</label>
            <textarea
              value={form.special_requests}
              onChange={(e) => setForm(f => ({ ...f, special_requests: e.target.value }))}
              placeholder="Any special requests or notes from WhatsApp..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-all resize-none"
            />
          </div>

          {/* Summary */}
          {nights > 0 && (
            <div className="bg-gold/5 border border-gold/20 rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-cream/50 text-xs">{nights} night{nights > 1 ? "s" : ""} × GH₵{rate.toLocaleString()}</p>
                <p className="text-white font-display text-2xl mt-0.5">GH₵{total.toLocaleString()}</p>
              </div>
              <div className="text-right text-cream/40 text-xs">
                <p>{format(new Date(form.check_in), "dd MMM")} →</p>
                <p>{format(new Date(form.check_out), "dd MMM yyyy")}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-white/5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-cream/50 text-xs uppercase tracking-widest font-bold hover:text-white transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-gold text-eden text-xs uppercase tracking-widest font-bold hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Log Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingsPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    setBookings((data as Booking[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (booking: Booking, status: string) => {
    setUpdating(booking.id);
    await supabase.from("bookings").update({ status }).eq("id", booking.id);
    
    // Auto-fire cancellation emails
    if (status === "cancelled" && booking.guest_email) {
      await emailApi.sendCancellation({
        to: booking.guest_email,
        name: booking.guest_name,
        bookingRef: booking.booking_reference,
      });
    }
    
    await fetchBookings();
    setUpdating(null);
  };

  const openWhatsApp = (booking: Booking) => {
    const phone = booking.guest_phone?.replace(/\D/g, "");
    const msg = `Hi ${booking.guest_name}! Diz Eden here. Your booking (Ref: ${booking.booking_reference}) for ${format(new Date(booking.check_in), "dd MMM")} – ${format(new Date(booking.check_out), "dd MMM yyyy")} is confirmed. Looking forward to hosting you!`;
    const url = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`
      : `https://wa.link/aboffc?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <LogBookingModal
          onClose={() => setShowModal(false)}
          onSaved={fetchBookings}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-light text-white">Bookings</h2>
            <p className="text-cream/40 text-sm mt-1">{bookings.length} total reservation{bookings.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchBookings}
              className="text-xs uppercase tracking-widest text-cream/40 border border-white/10 px-4 py-2 rounded-xl hover:text-white hover:border-white/30 transition-all"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold bg-gold text-eden px-5 py-2 rounded-xl hover:bg-white transition-all shadow-[0_8px_20px_-5px_rgba(212,175,55,0.4)]"
            >
              <Plus size={14} /> Log Booking
            </button>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-16 text-center">
            <p className="text-cream/30 text-sm mb-4">No bookings logged yet.</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold bg-gold/20 text-gold border border-gold/30 px-6 py-3 rounded-xl hover:bg-gold/30 transition-all"
            >
              <Plus size={14} /> Log your first WhatsApp booking
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const status = b.status || "pending";
              return (
                <div key={b.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="text-white font-semibold text-lg">{b.guest_name}</span>
                        <span className={`flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
                          {STATUS_ICON[status]} {status}
                        </span>
                      </div>
                      {b.guest_phone && <p className="text-cream/50 text-sm">{b.guest_phone}</p>}
                      {b.guest_email && !b.guest_email.includes("@guest.dizeden") && (
                        <p className="text-cream/50 text-sm">{b.guest_email}</p>
                      )}
                      <p className="text-gold/50 text-xs mt-1 font-mono uppercase">Ref: {b.booking_reference}</p>
                      {b.created_at && (
                        <p className="text-white/30 text-[10px] mt-1 italic uppercase tracking-tighter">
                          Booked: {format(new Date(b.created_at), "MMM d, yyyy HH:mm")}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-white font-display text-2xl">GH₵{b.total_amount.toLocaleString()}</p>
                      <p className="text-cream/40 text-xs">{b.num_nights} nights · {b.num_guests} guests</p>
                      <p className="text-cream/60 text-sm mt-1">
                        {format(new Date(b.check_in), "dd MMM")} → {format(new Date(b.check_out), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>

                  {b.special_requests && (
                    <div className="mt-4 bg-white/5 rounded-xl p-3 text-cream/60 text-sm italic">
                      "{b.special_requests}"
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-white/5">
                    {["confirmed", "pending", "cancelled"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(b, s)}
                        disabled={status === s || updating === b.id}
                        className={`text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-xl border transition-all disabled:opacity-40 ${
                          status === s ? STATUS_STYLES[s] : "text-white/30 border-white/10 hover:text-white hover:border-white/30"
                        }`}
                      >
                        {updating === b.id ? <Loader2 size={12} className="animate-spin inline" /> : s}
                      </button>
                    ))}
                    <button
                      onClick={() => openWhatsApp(b)}
                      className="ml-auto flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-xl border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all"
                    >
                      <ExternalLink size={12} /> Message Guest
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
