import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { viewportOnce } from "@/lib/animations";

const stats = [
  { value: 2, suffix: "", label: "Luxury Bedrooms" },
  { value: 100, suffix: "%", label: "Superhost Rating" },
  { value: 24, suffix: "/7", label: "Concierge Support" },
  { value: 98, suffix: "%", label: "Seamless Check-in" },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const duration = 1800;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return (
    <span ref={ref} className="text-display-2xl text-cream md:text-[5rem]">
      {count}{suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="bg-eden py-24 px-6 lg:py-32 lg:px-16 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 lg:grid-cols-4">
        {stats.map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6 }}
            className="group relative"
          >
            <div className="bg-white/[0.03] backdrop-blur-md rounded-[2.5rem] border border-white/10 p-10 flex flex-col items-center justify-center transition-all duration-500 group-hover:bg-white/[0.06] group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
              <div className="relative">
                <Counter target={s.value} suffix={s.suffix} />
                <div className="absolute -inset-4 bg-gold/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
              <p className="mt-6 text-label-sm text-gold font-bold tracking-[0.2em] uppercase text-center">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
