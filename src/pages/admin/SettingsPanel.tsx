import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2, Search, Trash2, AlertTriangle, X } from "lucide-react";

type Booking = {
  id: string;
  booking_reference: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: string | null;
  total_amount: number;
};

function DeleteBookingModal({
  booking,
  onClose,
  onDeleted,
}: {
  booking: Booking;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const canDelete = confirmText.trim() === booking.booking_reference;

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    setError("");

    // Release any dates this booking auto-blocked, or they stay stuck
    // unbookable forever with no record of why. Same fix as cancellation
    // in BookingsPanel — see PROJECT_STATE.md.
    await supabase
      .from("blocked_dates")
      .delete()
      .eq("reason", `Booked: ${booking.booking_reference}`);

    const { error: err } = await supabase.from("bookings").delete().eq("id", booking.id);

    setDeleting(false);
    if (err) {
      setError(err.message);
      return;
    }
    onDeleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0d2318] border border-red-500/20 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-red-400" />
            <h3 className="text-white font-semibold">Delete Booking</h3>
          </div>
          <button onClick={onClose} className="text-cream/40 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="px-7 py-6 space-y-4">
          <p className="text-cream/60 text-sm">
            This permanently deletes <strong className="text-white">{booking.guest_name}</strong>'s
            booking ({format(new Date(booking.check_in), "dd MMM")} →{" "}
            {format(new Date(booking.check_out), "dd MMM yyyy")}) and frees its dates. This cannot
            be undone — if you just want to reject a booking, use "Cancelled" status on the
            Bookings page instead.
          </p>

          {error && (
            <p className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2 rounded-xl">{error}</p>
          )}

          <div>
            <label className="text-[10px] uppercase tracking-widest text-red-400/80 font-bold block mb-1.5">
              Type <span className="font-mono text-white">{booking.booking_reference}</span> to confirm
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={booking.booking_reference}
              autoComplete="off"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-red-500/50 transition-all"
            />
          </div>
        </div>

        <div className="px-7 py-5 border-t border-white/5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-cream/50 text-xs uppercase tracking-widest font-bold hover:text-white transition-all">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-xs uppercase tracking-widest font-bold hover:bg-red-400 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPanel() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("id, booking_reference, guest_name, check_in, check_out, status, total_amount")
      .order("created_at", { ascending: false });
    setBookings((data as Booking[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const filtered = bookings.filter((b) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      b.booking_reference.toLowerCase().includes(q) ||
      b.guest_name.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  return (
    <>
      {target && (
        <DeleteBookingModal
          booking={target}
          onClose={() => setTarget(null)}
          onDeleted={fetchBookings}
        />
      )}

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-display font-light text-white">Settings</h2>
          <p className="text-cream/40 text-sm mt-1">Administrative tools</p>
        </div>

        <div className="bg-red-500/[0.03] border border-red-500/10 rounded-3xl p-7">
          <div className="flex items-center gap-2.5 mb-1.5">
            <AlertTriangle size={16} className="text-red-400/80" />
            <h3 className="text-white font-semibold">Danger Zone — Delete a Booking</h3>
          </div>
          <p className="text-cream/40 text-sm mb-5">
            Permanently removes a booking record and frees its dates. Use this only for junk,
            duplicate, or test entries — a real guest's booking should normally just be marked
            "Cancelled" on the Bookings page, which keeps the record for your history.
          </p>

          <div className="relative mb-4">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by reference or guest name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-cream/30 text-sm text-center py-8">No bookings match.</p>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {filtered.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-4 bg-white/[0.02] border border-white/5 rounded-xl px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-white text-sm font-medium truncate">{b.guest_name}</span>
                      <span className="text-gold/50 text-xs font-mono uppercase">{b.booking_reference}</span>
                      <span className="text-cream/30 text-xs uppercase">{b.status || "pending"}</span>
                    </div>
                    <p className="text-cream/40 text-xs mt-0.5">
                      {format(new Date(b.check_in), "dd MMM")} → {format(new Date(b.check_out), "dd MMM yyyy")}
                      {" · "}GH₵{b.total_amount.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setTarget(b)}
                    className="shrink-0 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
