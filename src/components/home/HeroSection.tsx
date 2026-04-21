import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImg from "@/assets/pics/hero-main.jpg";
import { fadeInUp, fadeIn, staggerContainer } from "@/lib/animations";
import SparkleText from "@/components/ui/sparkle-text";

export default function HeroSection() {
  const businessName = "Diz Eden";

  return (
    <section className="relative min-h-screen bg-eden lg:p-4">
      <div className="grid min-h-[calc(100vh-2rem)] lg:grid-cols-2 rounded-t-[3rem] overflow-hidden shadow-2xl">
        {/* Text — dark green background */}
        <motion.div
          className="flex flex-col justify-center bg-eden px-6 py-16 pt-28 sm:py-24 sm:pt-32 lg:px-16 lg:pt-32 lg:pb-24 border-r border-gold/5"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={fadeInUp}
            className="mb-10 sm:mb-12 relative"
          >
            <motion.h2 
              className="text-display-lg sm:text-display-xl text-gold font-light tracking-[0.15em] uppercase flex items-center flex-wrap"
              initial="initial"
              animate="animate"
              variants={{
                animate: {
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.5
                  }
                }
              }}
            >
              {businessName.split("").map((char, index) => (
                <motion.span
                  key={index}
                  variants={{
                    initial: { opacity: 0, y: 10 },
                    animate: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.1 }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", delay: 1.5 }}
                className="ml-2 w-[3px] h-[0.9em] bg-gold/60 inline-block align-middle"
              />
            </motion.h2>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "3rem" }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-6 h-[1.5px] bg-gradient-to-r from-gold to-transparent"
            />
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-display-xl leading-[1.1] text-cream md:text-display-2xl"
          >
            A place of
            <br />
            <SparkleText text="serenity" className="font-light text-gold italic pr-4" />
            <br />
            <span className="text-white/90">defined by you.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-8 sm:mt-10 max-w-md text-body-xl text-cream/70 leading-relaxed drop-shadow-sm"
          >
            Enter a world where time stands still. Diz Eden is more than a 2-bedroom luxury residence; it's a carefully crafted experience of pure, effortless elegance.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-8 sm:mt-12 flex items-center gap-3 sm:gap-8">
            <Link
              to="/gallery"
              target="_blank"
              className="bg-gold px-5 py-2.5 sm:px-10 sm:py-4 rounded-full text-[9px] sm:text-label-lg font-bold tracking-[0.1em] uppercase text-eden transition-all duration-500 hover:bg-white hover:scale-105 shadow-lg shadow-gold/20"
            >
              Explore Gallery
            </Link>
            <a
              href="/#contact"
              className="text-[9px] sm:text-label-lg font-bold tracking-[0.12em] uppercase text-cream/80 border-b border-gold/40 pb-1 transition-all duration-300 hover:text-gold hover:border-gold"
            >
              Connect →
            </a>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-8 sm:mt-16 inline-flex items-center gap-3 sm:gap-4 bg-white/[0.03] backdrop-blur-md rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 border border-white/5 lg:mt-20 w-fit"
          >
            <div className="flex flex-col">
              <span className="text-xl sm:text-display-sm text-gold font-bold leading-none">5.0</span>
            </div>
            <div className="flex flex-col">
              <div className="flex text-gold mb-1">
                {[...Array(5)].map((_, i) => <svg key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>)}
              </div>
              <span className="text-[9px] sm:text-label-sm text-white/40 uppercase tracking-widest font-semibold">Excellence on Google</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Image */}
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="relative h-[60vh] lg:h-auto m-3 sm:m-6 rounded-[2rem] sm:rounded-[4rem] overflow-hidden shadow-2xl"
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
