import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BedDouble, Bath, Users } from "lucide-react";
import { fadeInUp } from "@/lib/animations";
import type { Property } from "@/lib/properties";

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <motion.div variants={fadeInUp}>
      <Link to={`/properties/${property.slug}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.image}
            alt={property.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="mt-5">
          <span className="text-label-sm text-gold">{property.tagline}</span>
          <h3 className="mt-2 font-display text-2xl font-light text-foreground">
            {property.name}
          </h3>
          <div className="mt-3 flex items-center gap-4 text-body-md text-mid">
            <span className="flex items-center gap-1.5">
              <BedDouble size={14} className="text-gold" />
              {property.bedrooms} bed{property.bedrooms > 1 ? "s" : ""}
            </span>
            <span className="text-stone">·</span>
            <span className="flex items-center gap-1.5">
              <Bath size={14} className="text-gold" />
              {property.bathrooms} bath{property.bathrooms > 1 ? "s" : ""}
            </span>
            <span className="text-stone">·</span>
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-gold" />
              {property.maxGuests} guests
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display text-xl text-foreground">
              GHS {property.basePrice.toLocaleString()}
            </span>
            <span className="text-body-md text-light-mid">/ night</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
