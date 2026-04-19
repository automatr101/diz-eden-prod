import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, CheckCircle } from "lucide-react";

// Sub-component to safely use hooks inside the map
function StayRateCard({ label, dbKey, defaultValue }: { label: string; dbKey: string; defaultValue: string }) {
  const [val, setVal] = useState(defaultValue);
  const [localSaved, setLocalSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync with defaultValue when it loads from DB
  useEffect(() => {
    if (defaultValue) setVal(defaultValue);
  }, [defaultValue]);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("settings").upsert({ key: dbKey, value: val.toString() });
    setSaving(false);
    setLocalSaved(true);
    setTimeout(() => setLocalSaved(false), 2000);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <p className="text-[10px] uppercase tracking-widest text-gold font-bold mb-3">{label}</p>
      <div className="flex items-center gap-3">
        <span className="text-cream/50 text-sm font-display">GH₵</span>
        <input
          type="number"
          value={val}
          onChange={(e) => { setVal(e.target.value); setLocalSaved(false); }}
          className="flex-1 bg-transparent text-white text-2xl font-display font-light focus:outline-none border-b border-white/10 focus:border-gold pb-1 transition-all"
        />
        <span className="text-cream/30 text-xs">/ night</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-cream/30 text-xs">≈ ${Math.ceil(Number(val) / 15.5)} USD</p>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-xl transition-all ${
            localSaved
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30"
          }`}
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : localSaved ? <><CheckCircle size={12} /> Saved</> : <><Save size={12} /> Save</>}
        </button>
      </div>
    </div>
  );
}

export default function PricingPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  
  // Local state for the settings table values
  const [rates, setRates] = useState<{ nightly_rate: string; cleaning_fee: string; price_1br: string; price_2br: string }>({
    nightly_rate: "1800",
    cleaning_fee: "200",
    price_1br: "1200",
    price_2br: "1800",
  });

  const fetchRates = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("settings").select("*");
    if (!error && data) {
      const settingsObj: Record<string, string> = {};
      data.forEach((row) => {
        settingsObj[row.key] = row.value;
      });
      setRates({
        nightly_rate: settingsObj['nightly_rate'] || "1800",
        cleaning_fee: settingsObj['cleaning_fee'] || "200",
        price_1br: settingsObj['price_1br'] || "1200",
        price_2br: settingsObj['price_2br'] || "1800",
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchRates(); }, []);

  const handleSaveBackendRates = async () => {
    setSaving('backend');
    
    // Update both rates in the settings table
    await supabase.from("settings").upsert([
      { key: 'nightly_rate', value: rates.nightly_rate },
      { key: 'cleaning_fee', value: rates.cleaning_fee }
    ]);
    
    setSaving(null);
    setSaved('backend');
    setTimeout(() => setSaved(null), 2000);
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
        <p className="text-cream/40 text-sm mt-1">Update nightly rates and cleaning fees</p>
      </div>

      {/* Database GHS rates for Main Page visual display */}
      <div className="bg-gold/5 border border-gold/20 rounded-2xl p-6">
        <h3 className="text-gold font-bold text-xs uppercase tracking-widest mb-4">Stay Selector Rates (Visual Display)</h3>
        <p className="text-cream/60 text-sm mb-4">
          These rates are displayed on the main page gallery stay selector. Update the values here to reflect current pricing.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <StayRateCard label="1 Bedroom Stay" dbKey="price_1br" defaultValue={rates.price_1br} />
          <StayRateCard label="2 Bedroom Stay" dbKey="price_2br" defaultValue={rates.price_2br} />
        </div>
      </div>

      {/* Database actual rates for the booking system */}
      <div>
        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
          Active Booking System Rates (Supabase)
        </h3>
        
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h4 className="text-white font-semibold flex items-center gap-2">
                Diz Eden Luxury Apartment
              </h4>
              <p className="text-cream/40 text-xs mt-0.5">Backend Rates synced with the booking processor</p>
            </div>
            <button
              onClick={handleSaveBackendRates}
              disabled={saving === 'backend'}
              className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold px-5 py-2.5 rounded-xl border transition-all ${
                saved === 'backend'
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-gold/20 text-gold border-gold/30 hover:bg-gold/30"
              }`}
            >
              {saving === 'backend' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : saved === 'backend' ? (
                <><CheckCircle size={12} /> Saved</>
              ) : (
                <><Save size={12} /> Sync to Database</>
              )}
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold block mb-2">
                Nightly Rate (GH₵)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40 text-sm">GH₵</span>
                <input
                  type="number"
                  value={rates.nightly_rate}
                  onChange={(e) => setRates({ ...rates, nightly_rate: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-lg font-display focus:outline-none focus:border-gold/50 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold block mb-2">
                Cleaning Fee (GH₵)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40 text-sm">GH₵</span>
                <input
                  type="number"
                  value={rates.cleaning_fee}
                  onChange={(e) => setRates({ ...rates, cleaning_fee: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-lg font-display focus:outline-none focus:border-gold/50 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
