import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BedDouble, Bath, Users, Maximize, ChevronLeft, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingWidget from "@/components/booking/BookingWidget";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { usePropertyBySlug } from "@/hooks/useProperty";
import { properties as staticProperties } from "@/lib/properties";

export default function PropertyDetail() {
  const property = staticProperties[0]; // Or `apartment` directly exported

  if (!property) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center pt-20">
          <p className="text-body-xl text-mid">Loading details...</p>
        </div>
        <Footer />
      </>
    );
  }

  const amenities = (property.amenities as string[]) || [];
  const dbImages = property.image ? [property.image] : [];
  const heroImage = property.image;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Gallery */}
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          <Link to="/properties" className="inline-flex items-center gap-1 text-label-sm text-light-mid hover:text-gold transition-colors mb-6">
            <ChevronLeft size={14} /> Back to Properties
          </Link>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid gap-2 lg:grid-cols-[2fr_1fr_1fr] lg:grid-rows-2 lg:aspect-[2.4/1] overflow-hidden"
          >
            <div className="lg:row-span-2 overflow-hidden">
              <OptimizedImage 
                src={heroImage} 
                alt={property.name} 
                className="h-full w-full object-cover" 
                fetchPriority="high"
                loading="eager"
              />
            </div>
            {dbImages.slice(1, 5).map((img, i) => (
              <div key={i} className="hidden lg:block overflow-hidden">
                <OptimizedImage 
                  src={img} 
                  alt={`${property.name} ${i + 2}`} 
                  className="h-full w-full object-cover" 
                />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Content */}
        <div className="mx-auto mt-12 grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_380px] lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-label-lg text-gold">{property.tagline}</span>
            <h1 className="mt-3 text-display-xl text-foreground">{property.name}</h1>

            {property.location && (
              <div className="mt-2 flex items-center gap-1.5 text-body-md text-mid">
                <MapPin size={14} className="text-gold" />
                {property.location}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-body-md text-mid">
              <span className="flex items-center gap-1.5"><BedDouble size={14} className="text-gold" />{property.bedrooms} bedroom{property.bedrooms > 1 ? "s" : ""}</span>
              <span className="text-stone">·</span>
              <span className="flex items-center gap-1.5"><Bath size={14} className="text-gold" />{property.bathrooms} bathroom{property.bathrooms > 1 ? "s" : ""}</span>
              <span className="text-stone">·</span>
              <span className="flex items-center gap-1.5"><Users size={14} className="text-gold" />{property.max_guests} guests</span>
              {property.floor_area_m2 && (
                <>
                  <span className="text-stone">·</span>
                  <span className="flex items-center gap-1.5"><Maximize size={14} className="text-gold" />{property.floor_area_m2}m²</span>
                </>
              )}
            </div>

            <div className="mt-8 border-t border-stone pt-8">
              <p className="text-body-xl text-mid leading-relaxed">{property.description}</p>
            </div>

            {amenities.length > 0 && (
              <div className="mt-8 border-t border-stone pt-8">
                <h2 className="text-display-sm text-foreground">Amenities</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {amenities.map((a) => (
                    <div key={a} className="flex items-center gap-3 text-body-md text-foreground">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-stone pt-8">
              <h2 className="text-display-sm text-foreground">House Rules</h2>
              <ul className="mt-6 space-y-2 text-body-md text-mid">
                <li>• Check-in from 3:00 PM, check-out by 11:00 AM</li>
                <li>• No smoking inside the property</li>
                <li>• No parties or events</li>
                <li>• Pets considered on request</li>
              </ul>
            </div>

            {/* Google Maps */}

          </motion.div>

          <motion.div
            id="booking-widget"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:sticky lg:top-28 h-fit pb-24 lg:pb-0"
          >
            <BookingWidget property={property} />
          </motion.div>
        </div>
      </main>

      {/* Sleek Mobile Sticky Bottom Bar (Airbnb Style) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-eden p-4 px-6 border-t border-gold/10 lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.2)] pb-safe transform transition-transform">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-display-sm text-foreground font-medium leading-none">
              GH₵{property.basePrice.toLocaleString()}
            </p>
            <p className="text-body-md text-gold mt-1 underline decoration-gold/30 underline-offset-4">
              per night
            </p>
          </div>
          <button 
            onClick={() => window.scrollTo({ top: document.getElementById('booking-widget')?.offsetTop || 0, behavior: 'smooth' })}
            className="bg-gold px-6 py-2.5 rounded-full text-label-sm font-bold uppercase tracking-widest text-eden hover:bg-white transition-colors active:scale-95 shadow-lg shadow-gold/20"
          >
            Reserve
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}
