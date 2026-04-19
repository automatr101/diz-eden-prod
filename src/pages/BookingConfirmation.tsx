import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function BookingConfirmation() {
  const [params] = useSearchParams();
  const ref = params.get("ref") || "—";

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 px-6 lg:px-16">
        <div className="mx-auto max-w-xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <CheckCircle size={64} className="mx-auto text-gold" />
            <h1 className="mt-6 text-display-xl text-foreground">Booking Confirmed</h1>
            <p className="mt-4 text-body-xl text-mid">
              Your reservation has been received. We'll be in touch with check-in details.
            </p>

            <div className="mt-8 border border-stone p-6">
              <span className="text-label-sm text-gold">Booking Reference</span>
              <p className="mt-2 font-display text-3xl text-foreground tracking-wider">{ref}</p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/233256071641?text=Hi!%20My%20booking%20reference%20is%20${ref}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gold py-4 px-8 text-label-lg font-semibold tracking-widest text-eden transition-all duration-300 hover:bg-gold-dark"
              >
                Message on WhatsApp
              </a>
              <Link
                to="/"
                className="border border-eden py-4 px-8 text-label-lg tracking-widest text-foreground transition-all duration-300 hover:bg-eden hover:text-cream"
              >
                Return Home
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
