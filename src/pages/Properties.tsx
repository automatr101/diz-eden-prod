import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/home/PropertyCard";
import { properties } from "@/lib/properties";
import { viewportOnce } from "@/lib/animations";

const filters = ["All", "1 Bedroom", "2 Bedroom", "3 Bedroom"];

export default function Properties() {
  const [active, setActive] = useState("All");

  const filtered = properties.filter((p) => {
    if (active === "All") return true;
    const beds = parseInt(active);
    return p.bedrooms === beds;
  });

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 px-6 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-label-sm text-light-mid">Home / Properties</span>
            <h1 className="mt-4 text-display-xl text-foreground">Our Residences</h1>
            <p className="mt-4 max-w-lg text-body-xl text-mid">
              Three distinct spaces, each designed with intention and care.
            </p>
          </motion.div>

          <div className="mt-10 flex gap-3">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`px-5 py-2.5 text-label-sm transition-colors duration-300 ${
                  active === f
                    ? "bg-eden text-cream"
                    : "border border-stone text-mid hover:border-eden hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PropertyCard key={p.slug} property={p} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
