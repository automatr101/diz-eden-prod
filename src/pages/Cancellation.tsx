import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function Cancellation() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-eden pt-32 pb-24 text-cream/70">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl px-6"
        >
          <h1 className="text-4xl md:text-5xl font-display text-white mb-10">Cancellation Policy</h1>
          
          <div className="space-y-8 text-body-lg leading-relaxed">
            <section>
              <p className="text-xl italic text-gold mb-8 border-l-2 border-gold/30 pl-4 py-1">
                At Diz Eden, we understand that plans can change. We have designed our cancellation policy to be as fair as possible to both our guests and our business.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-gold mb-3 font-bold uppercase tracking-widest">Standard Cancellations</h2>
              <ul className="list-disc pl-5 mt-2 space-y-4">
                <li>
                  <strong className="text-white font-medium block mb-1">Full Refund (48 Hours+ Notice)</strong>
                  Guests can cancel their reservation up to 48 hours before the scheduled check-in time (3:00 PM local time on the arrival date) for a full 100% refund of the booking amount.
                </li>
                <li>
                  <strong className="text-white font-medium block mb-1">Partial Refund (24-48 Hours Notice)</strong>
                  Cancellations made between 24 and 48 hours before check-in will receive a 50% refund.
                </li>
                <li>
                  <strong className="text-white font-medium block mb-1">No Refund (Less than 24 Hours Notice)</strong>
                  Cancellations made less than 24 hours before check-in or "no-shows" will not be eligible for a refund.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl text-gold mb-3 font-bold uppercase tracking-widest">How to Cancel</h2>
              <p>To process a cancellation, please immediately contact our support team via WhatsApp or email using the phone number provided in your booking confirmation. The timestamp of your message will be used to determine eligibility under the policy tiers above.</p>
            </section>

            <section>
              <h2 className="text-xl text-gold mb-3 font-bold uppercase tracking-widest">Modifications</h2>
              <p>Date modifications are subject to availability and the nightly rate of the newly selected dates. Minor adjustments (adding a guest) are generally permitted for free provided the total does not exceed the property's maximum capacity.</p>
            </section>

            <section>
              <p className="mt-4 text-sm opacity-50">Last Updated: {new Date().getFullYear()}</p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
