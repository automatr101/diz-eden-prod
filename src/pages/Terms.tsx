import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function Terms() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-eden pt-32 pb-24 text-cream/70">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl px-6"
        >
          <h1 className="text-4xl md:text-5xl font-display text-white mb-10">Terms of Service</h1>
          
          <div className="space-y-8 text-body-lg leading-relaxed">
            <section>
              <h2 className="text-xl text-gold mb-3 font-bold uppercase tracking-widest">1. Booking Agreement</h2>
              <p>By placing a booking at Diz Eden, you agree to these Terms of Service. All bookings are subject to availability and formal confirmation via email or WhatsApp from our team following successful payment.</p>
            </section>

            <section>
              <h2 className="text-xl text-gold mb-3 font-bold uppercase tracking-widest">2. Check-in & Check-out</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong className="text-white font-medium">Check-in:</strong> 3:00 PM onwards.</li>
                <li><strong className="text-white font-medium">Check-out:</strong> By 11:00 AM.</li>
                <li>Early check-ins and late check-outs must be requested in advance and may incur additional charges.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl text-gold mb-3 font-bold uppercase tracking-widest">3. House Rules</h2>
              <p>Guests are expected to treat the property with respect. Violating any of the following rules may result in immediate eviction without refund:</p>
              <ul className="list-disc pl-5 mt-4 space-y-1">
                <li>No smoking or vaping of any kind indoors.</li>
                <li>No loud parties or unapproved events.</li>
                <li>Only the number of registered guests are allowed overnight or on the premises.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl text-gold mb-3 font-bold uppercase tracking-widest">4. Liability & Damages</h2>
              <p>The guest booking the reservation is solely responsible for any damage or loss caused to the apartment, its fixtures, or furnishings during their stay. Diz Eden is not liable for the loss or damage of personal belongings left in the apartment.</p>
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
