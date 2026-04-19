import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImg from "@/assets/pics/hero-main.jpg";
import { fadeInUp, fadeIn, staggerContainer } from "@/lib/animations";
import SparkleText from "@/components/ui/sparkle-text";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-eden lg:p-4">
      <div className="grid min-h-[calc(100vh-2rem)] lg:grid-cols-2 rounded-t-[3rem] overflow-hidden shadow-2xl">
        {/* Text — dark green background */}
        <motion.div
          className="flex flex-col justify-center bg-eden px-6 py-24 pt-32 lg:px-16 lg:pt-32 lg:pb-24 border-r border-gold/5"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={fadeInUp}
            className="flex items-center gap-3 mb-4"
          >
            <span className="w-12 h-[1px] bg-gold/50" />
            <span className="text-label-sm uppercase tracking-[0.3em] text-gold font-bold">
              East Legon, Accra
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="mt-6 text-display-xl leading-[1.1] text-cream md:text-display-2xl"
          >
            A place of
            <br />
            <SparkleText text="serenity" className="font-light text-gold italic pr-4" />
            <br />
            <span className="text-white/90">defined by you.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-10 max-w-md text-body-xl text-cream/70 leading-relaxed drop-shadow-sm"
          >
            Enter a world where time stands still. Diz Eden is more than a 2-bedroom luxury residence; it's a carefully crafted experience of pure, effortless elegance.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-12 flex flex-wrap items-center gap-8">
            <Link
              to="/gallery"
              target="_blank"
              className="bg-gold px-10 py-4 rounded-full text-label-lg font-bold tracking-[0.1em] uppercase text-eden transition-all duration-500 hover:bg-white hover:scale-105 shadow-lg shadow-gold/20"
            >
              Explore Gallery
            </Link>
            <a
              href="/#contact"
              className="text-label-lg font-bold tracking-[0.1em] uppercase text-cream/80 border-b border-gold/40 pb-1 transition-all duration-300 hover:text-gold hover:border-gold hover:tracking-widest"
            >
              Connect →
            </a>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-16 inline-flex items-center gap-4 bg-white/[0.03] backdrop-blur-md rounded-2xl px-6 py-4 border border-white/5 lg:mt-20 w-fit"
          >
            <div className="flex flex-col">
              <span className="text-display-sm text-gold font-bold leading-none">5.0</span>
            </div>
            <div className="flex flex-col">
              <div className="flex text-gold mb-1">
                {[...Array(5)].map((_, i) => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>)}
              </div>
              <span className="text-label-sm text-white/40 uppercase tracking-widest font-semibold">Excellence on Google</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Image */}
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="relative h-[60vh] lg:h-auto"
        >
          <img
            src={heroImg}
            alt="Diz Eden luxury apartment interior in East Legon, Accra"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
