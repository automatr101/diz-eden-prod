import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { fadeInUp, viewportOnce } from "@/lib/animations";

const testimonials = [
  {
    quote: "Exactly as described. Ultra-modern, super clean and extremely well situated in East Legon. The attention to detail is remarkable.",
    name: "Kwame Osei",
    source: "Google Reviews",
    date: "April 2025"
  },
  {
    quote: "A true home. The security is top-notch and the apartment is stunning. Kweku is a fantastic host who ensures everything is perfect.",
    name: "Sarah Williams",
    source: "Airbnb Superhost",
    date: "March 2025"
  },
  {
    quote: "The bathrooms are huge and the daily cleaning service was a great plus. Set a new standard for our stays in Accra.",
    name: "Michael Chen",
    source: "Airbnb Guest",
    date: "February 2025"
  },
  {
    quote: "The curated welcome hamper and premium linens made us feel like royalty. A masterclass in modern luxury living.",
    name: "Elena Rodriguez",
    source: "Google Maps",
    date: "January 2025"
  }
];

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="bg-eden py-24 px-6 lg:py-32 lg:px-16 overflow-hidden relative">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          className="text-center mb-16"
        >
          <span className="text-label-sm uppercase tracking-[0.4em] font-bold text-gold">Trusted Experience</span>
          <h2 className="mt-4 text-display-lg text-white md:text-display-xl">
            Voices of <em className="font-light text-gold">Diz Eden</em>
          </h2>
        </motion.div>

        <div className="relative min-h-[400px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="w-full text-center px-4 md:px-20"
            >
              <div className="flex justify-center mb-8">
                <span className="font-display text-9xl text-gold/20 leading-none">"</span>
              </div>
              
              <p className="font-display text-2xl md:text-4xl font-light italic text-cream leading-tight mb-12">
                {testimonials[index].quote}
              </p>

              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="fill-gold text-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                ))}
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-white tracking-widest uppercase">
                  {testimonials[index].name}
                </span>
                <span className="text-label-sm text-gold/60 mt-2 font-bold tracking-[0.2em]">
                  {testimonials[index].source} • {testimonials[index].date}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none">
            <button 
              onClick={prev}
              className="p-4 rounded-full border border-white/10 text-white/40 hover:text-gold hover:border-gold transition-all pointer-events-auto bg-eden/50 backdrop-blur-sm -ml-4 md:ml-0"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={next}
              className="p-4 rounded-full border border-white/10 text-white/40 hover:text-gold hover:border-gold transition-all pointer-events-auto bg-eden/50 backdrop-blur-sm -mr-4 md:mr-0"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center mt-16 gap-3">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 transition-all duration-500 rounded-full ${i === index ? 'w-12 bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'w-3 bg-white/20'}`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
