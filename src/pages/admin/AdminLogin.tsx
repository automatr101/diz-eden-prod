import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import logoImg from "@/assets/diz-eden-logo.jpg";

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── SECURITY: Brute-force protection ───────────────────────
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number>(0);
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 30_000; // 30 seconds

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ─── SECURITY: Lockout check ─────────────────────────────
    const now = Date.now();
    if (now < lockedUntil) {
      const secsLeft = Math.ceil((lockedUntil - now) / 1000);
      setError(`Too many failed attempts. Try again in ${secsLeft}s.`);
      return;
    }

    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS);
        setFailedAttempts(0);
        setError(`Account locked for 30 seconds after ${MAX_ATTEMPTS} failed attempts.`);
      } else {
        setError(`Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
    } else {
      setFailedAttempts(0);
      onLogin();
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a1f14] flex items-center justify-center px-4">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212,175,55,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-10 backdrop-blur-xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="p-1 rounded-full border border-gold/30 mb-4">
              <img
                src={logoImg}
                alt="Diz Eden"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-display font-light text-white tracking-wide">
              Admin Portal
            </h1>
            <p className="text-cream/40 text-sm mt-1 tracking-widest uppercase text-xs">
              Diz Eden Management
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all text-sm"
                placeholder="admin@dizeden.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2 flex items-center gap-2">
                <Lock size={14} />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-gold text-eden font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-white transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
