import { motion } from "framer-motion";
import PropertyCard from "./PropertyCard";
import { properties } from "@/lib/properties";
import { viewportOnce } from "@/lib/animations";

const stagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.15 } },
};

export default function PropertiesGrid() {
  return (
    <section className="py-16 px-6 lg:py-28 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.7 }}
          className="mb-16 max-w-xl"
        >
          <span className="text-label-lg text-gold">Our Residences</span>
          <h2 className="mt-4 text-display-lg text-foreground md:text-display-xl">
            Spaces crafted for <em className="font-light">extraordinary</em> living
          </h2>
        </motion.div>

        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
        >
          {properties.map((p) => (
            <PropertyCard key={p.slug} property={p} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
