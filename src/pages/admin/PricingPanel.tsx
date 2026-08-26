import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, CheckCircle } from "lucide-react";

// Keys as read by the booking checkout (src/pages/Booking.tsx)
const RATE_FIELDS = [
  { key: "nightly_rate", label: "1 Bedroom Rate" },
  { key: "nightly_rate_2bed", label: "2 Bedroom Rate" },
  { key: "cleaning_fee", label: "Cleaning Fee" },
] as const;

type RateKey = (typeof RATE_FIELDS)[number]["key"];
type Rates = Record<RateKey, string>;

const DEFAULTS: Rates = {
  nightly_rate: "1200",
  nightly_rate_2bed: "1800",
  cleaning_fee: "200",
};

export default function PricingPanel() {
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<Rates>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .in("key", RATE_FIELDS.map((f) => f.key));

    if (error) {
      setError("Could not load current rates. Try refreshing.");
    } else {
      const settingsObj: Record<string, string> = {};
      (data || []).forEach((row) => {
        settingsObj[row.key] = row.value;
      });
      setRates({
        nightly_rate: settingsObj.nightly_rate || DEFAULTS.nightly_rate,
        nightly_rate_2bed: settingsObj.nightly_rate_2bed || DEFAULTS.nightly_rate_2bed,
        cleaning_fee: settingsObj.cleaning_fee || DEFAULTS.cleaning_fee,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const { error } = await supabase.from("settings").upsert(
      RATE_FIELDS.map((f) => ({ key: f.key, value: rates[f.key] }))
    );

    setSaving(false);
    if (error) {
      setError("Failed to save rates. Please try again.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-light text-white">Pricing</h2>
        <p className="text-cream/40 text-sm mt-1">
          These are the live rates the booking checkout charges guests.
        </p>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h4 className="text-white font-semibold">Diz Eden Booking Rates</h4>
            <p className="text-cream/40 text-xs mt-0.5">
              Synced with the booking checkout (settings table)
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold px-5 py-2.5 rounded-xl border transition-all ${
              saved
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-gold/20 text-gold border-gold/30 hover:bg-gold/30"
            }`}
          >
            {saving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : saved ? (
              <>
                <CheckCircle size={12} /> Saved
              </>
            ) : (
              <>
                <Save size={12} /> Save Rates
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="mb-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
            {error}
          </p>
        )}

        <div className="grid sm:grid-cols-3 gap-6">
          {RATE_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold block mb-2">
                {label} (GH₵)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40 text-sm">
                  GH₵
                </span>
                <input
                  type="number"
                  value={rates[key]}
                  onChange={(e) => setRates({ ...rates, [key]: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-lg font-display focus:outline-none focus:border-gold/50 transition-all"
                />
              </div>
              {(key === "nightly_rate" || key === "nightly_rate_2bed") && (
                <p className="mt-2 text-cream/30 text-xs">
                  ≈ ${Math.ceil(Number(rates[key]) / 15.5)} USD / night
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
