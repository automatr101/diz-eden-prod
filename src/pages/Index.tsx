import { useState, useEffect } from "react";
import HeroSection from "@/components/home/HeroSection";
import BookingBar from "@/components/home/BookingBar";
import ResidenceShowcase from "@/components/home/ResidenceShowcase";
import ExperienceSection from "@/components/home/ExperienceSection";
import MosaicSlideshow from "@/components/home/MosaicSlideshow";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import { Contact2 } from "@/components/ui/contact-2";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BouncingDots } from "@/components/ui/bouncing-dots";
import WhatsAppWidget from "@/components/ui/whatsapp-widget";
import { AnimatePresence, motion } from "framer-motion";

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-eden"
          >
            <BouncingDots message="Diz Eden" />
          </motion.div>
        )}
      </AnimatePresence>
      <Navbar />
      <main>
        <HeroSection />
        <BookingBar />
        <ResidenceShowcase />
        <ExperienceSection />
        <MosaicSlideshow />
        <StatsSection />
        <TestimonialsSection />
        <div id="contact">
          <Contact2 
            title="Book Your Home"
            description="Our concierge team is standing by to ensure your stay at Diz Eden is nothing short of extraordinary."
            phone="+233 25 607 1641"
            web={{ label: "Chat on WhatsApp", url: "https://wa.link/aboffc" }}
          />
        </div>
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  );
}
