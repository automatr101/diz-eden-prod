import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function Privacy() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-eden pt-32 pb-24 text-cream/70">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl px-6"
        >
          <h1 className="text-4xl md:text-5xl font-display text-white mb-10">Privacy Policy</h1>
          
          <div className="space-y-8 text-body-lg leading-relaxed">
            <section>
              <h2 className="text-xl text-gold mb-3 font-bold uppercase tracking-widest">1. Information We Collect</h2>
              <p>When you book a stay at Diz Eden, we carefully collect the necessary information to ensure a seamless experience. This includes your full name, email address, phone number, and special requests. Payment information is securely processed by our payment partner (Paystack) and is never stored on our servers.</p>
            </section>

            <section>
              <h2 className="text-xl text-gold mb-3 font-bold uppercase tracking-widest">2. How We Use Your Data</h2>
              <p>Your data is exclusively used to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Process your reservations and send confirmations.</li>
                <li>Contact you regarding check-in procedures via email or WhatsApp.</li>
                <li>Respond to customer service inquiries.</li>
                <li>Fulfill legal and accounting obligations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl text-gold mb-3 font-bold uppercase tracking-widest">3. Data Security</h2>
              <p>We take the security of your personal information seriously. Our platforms are secured with modern encryption technologies. Staff access to your booking information is strictly limited to need-to-know administrative operations.</p>
            </section>

            <section>
              <h2 className="text-xl text-gold mb-3 font-bold uppercase tracking-widest">4. Third Parties</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. Data is only shared with secured third-party services directly responsible for fulfilling your booking (such as our secure database hosting and payment processor).</p>
            </section>

            <section>
              <h2 className="text-xl text-gold mb-3 font-bold uppercase tracking-widest">5. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at our provided business email or phone number listed on the site.</p>
              <p className="mt-4 text-sm opacity-50">Last Updated: {new Date().getFullYear()}</p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
