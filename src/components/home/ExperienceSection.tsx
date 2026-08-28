import { motion } from "framer-motion";
import { slideInLeft, slideInRight, viewportOnce } from "@/lib/animations";
import experienceImg from "@/assets/pics/interior-1.jpg";

const amenities = [
  "Dedicated concierge & 24/7 guest support",
  "Curated welcome hamper on arrival",
  "Premium linen and towel service included",
  "High-speed Wi-Fi and smart home features",
  "Private parking available on request",
  "Daily housekeeping available on request",
  "Blackout curtains, luxury mattresses, quality bedding",
  "Fully equipped gourmet kitchen",
];

export default function ExperienceSection() {
  return (
    <section id="experience" className="bg-eden py-12 px-6 sm:py-20 lg:py-28 lg:px-16 border-t border-white/5">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[55%_45%] lg:gap-20">
        <motion.div
          className="relative aspect-[16/10] sm:aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-[600px] rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl"
          variants={slideInLeft}
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
        >
          <img
            src={experienceImg}
            alt="Luxury living room with garden view and natural materials"
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[1.5rem] sm:rounded-[2rem]" />
        </motion.div>

        <motion.div
          variants={slideInRight}
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
        >
          <span className="text-label-sm uppercase tracking-[0.3em] font-bold text-gold">The Diz Eden Experience</span>
          <h2 className="mt-4 text-display-md sm:text-display-lg text-white md:text-display-xl leading-tight">
            Luxury in every <em className="font-light text-gold">detail</em>
          </h2>
          <p className="mt-6 sm:mt-8 text-lg sm:text-body-xl text-cream leading-relaxed font-light">
            Every stay includes daily housekeeping, premium linens, high-speed
            Wi-Fi, and a dedicated concierge on call around the clock — the
            details that make a short stay feel like home.
          </p>

          <ul className="mt-8 sm:mt-10 grid gap-3 sm:gap-4 sm:grid-cols-2">
            {amenities.map((a) => (
              <li key={a} className="flex items-center gap-3 text-body-md text-cream font-medium">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                {a}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
