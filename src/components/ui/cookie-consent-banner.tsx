import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { loadAnalytics } from "@/lib/analytics";

export function CookieConsentBanner() {
  const { status, loaded, accept, decline } = useCookieConsent();

  const handleAccept = () => {
    accept();
    loadAnalytics();
  };

  return (
    <AnimatePresence>
      {loaded && status === null && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="fixed bottom-0 left-0 right-0 z-[90] print:hidden"
        >
          <div className="mx-auto max-w-4xl m-4 rounded-2xl border border-white/10 bg-eden/95 backdrop-blur-xl p-5 shadow-2xl sm:flex sm:items-center sm:justify-between sm:gap-6">
            <p className="text-cream/70 text-sm leading-relaxed">
              We use cookies to improve your experience and understand how guests find Diz Eden.
              See our{" "}
              <Link to="/privacy" className="text-gold underline hover:text-white transition-colors">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
            <div className="mt-4 sm:mt-0 flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={decline}
                className="text-cream/50 hover:text-white text-xs uppercase tracking-widest font-bold px-4 py-2.5 transition-colors"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="bg-gold text-eden text-xs uppercase tracking-widest font-bold px-6 py-2.5 rounded-xl hover:bg-white transition-all"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
