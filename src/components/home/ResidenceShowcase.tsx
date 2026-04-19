import { motion } from "framer-motion";
import { fadeInUp, viewportOnce, staggerContainer } from "@/lib/animations";
import { BedDouble, Bath, Maximize, Users } from "lucide-react";
import { apartment } from "@/lib/properties";
import { AnimatedTabs } from "@/components/ui/animated-tabs";

export default function ResidenceShowcase() {
  return (
    <section id="residence" className="py-24 px-6 lg:py-32 lg:px-16 overflow-hidden bg-eden">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-16">
          <motion.div
            initial="initial"
            whileInView="animate"
            variants={staggerContainer}
            viewport={viewportOnce}
            className="text-center md:text-left md:max-w-2xl"
          >
            <motion.span variants={fadeInUp} className="text-gold font-bold tracking-[0.3em] uppercase text-xs">Diz Eden</motion.span>
            <motion.h2 variants={fadeInUp} className="mt-4 text-4xl md:text-7xl font-display font-light text-white leading-tight">
              Sophisticated <br/><em className="font-light italic text-gold">Living Spaces</em>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-8 text-xl text-cream leading-relaxed max-w-xl">
              {apartment.description}
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-8 border-t border-white/10 pt-10">
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-gold/60"><BedDouble size={18}/> <span className="text-[10px] uppercase tracking-widest font-bold">Bedrooms</span></span>
                <span className="text-xl font-display text-white">2 Suites</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-gold/60"><Bath size={18}/> <span className="text-[10px] uppercase tracking-widest font-bold">Bathrooms</span></span>
                <span className="text-xl font-display text-white">2 En-suite</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-gold/60"><Users size={18}/> <span className="text-[10px] uppercase tracking-widest font-bold">Capacity</span></span>
                <span className="text-xl font-display text-white">4 Guests</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-gold/60"><Maximize size={18}/> <span className="text-[10px] uppercase tracking-widest font-bold">Floor Area</span></span>
                <span className="text-xl font-display text-white">120 sqm</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={viewportOnce}
            className="w-full"
          >
            <AnimatedTabs className="max-w-7xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
