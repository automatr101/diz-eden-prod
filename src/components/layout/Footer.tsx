import { Link } from "react-router-dom";
import { Instagram, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const footerLinks = {
  properties: [
    { label: "The Terrace Suite", href: "/properties/terrace-suite" },
    { label: "The Garden Flat", href: "/properties/garden-flat" },
    { label: "The Studio Loft", href: "/properties/studio-loft" },
  ],
  company: [
    { label: "About Us", href: "/#about" },
    { label: "Experience", href: "/#experience" },
    { label: "Contact", href: "/#contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cancellation Policy", href: "/cancellation" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-eden text-cream/70 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mx-auto max-w-7xl px-6 py-20 lg:px-16"
      >
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full border border-gold/30 animate-pulse" />
              <img 
                src="/logo.png" 
                alt="Diz Eden" 
                className="h-20 w-20 rounded-full object-cover border-2 border-gold shadow-lg shadow-gold/20" 
                style={{ objectPosition: 'center 35%', transform: 'scale(1.4)', transformOrigin: 'center 35%' }}
              />
            </div>
            <p className="text-body-md text-cream/60 max-w-xs leading-relaxed text-center md:text-left">
              Experience the pinnacle of luxury living at Diz Eden, East Legon's premier residential home.
            </p>
            <div className="mt-6 space-y-3 text-body-md text-cream/50">
              <a href="tel:+233256071641" className="flex items-center gap-3 hover:text-gold transition-all duration-300">
                <Phone size={14} className="text-gold" /> +233 25 607 1641
              </a>
              <div className="flex items-center gap-3">
                <MapPin size={14} className="text-gold" /> East Legon, Accra, Ghana
              </div>
            </div>
            <div className="mt-8 flex gap-5">
              <a href="https://www.instagram.com/diz.eden/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-white/10 text-cream/40 transition-all duration-300 hover:text-gold hover:border-gold hover:scale-110" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://www.tiktok.com/@diz.eden_" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-white/10 text-cream/40 transition-all duration-300 hover:text-gold hover:border-gold hover:scale-110" aria-label="TikTok">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </a>
              <a href="https://wa.link/aboffc" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-white/10 text-cream/40 transition-all duration-300 hover:text-gold hover:border-gold hover:scale-110 flex items-center justify-center" aria-label="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .062 5.388.059 11.992c0 2.11.543 4.17 1.576 5.955L0 24l6.152-1.613a11.82 11.82 0 005.891 1.569h.005c6.604 0 11.987-5.389 11.99-11.993a11.847 11.847 0 00-3.623-8.47" />
                </svg>
              </a>
            </div>
          </div>

          {/* Company */}
          <div className="lg:pl-12">
            <h4 className="text-label-lg text-gold font-bold uppercase tracking-widest mb-8">Navigation</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-body-md text-cream/60 transition-colors hover:text-gold inline-flex items-center group">
                    <span className="w-0 h-[1px] bg-gold mr-0 transition-all duration-300 group-hover:w-4 group-hover:mr-2" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:pl-12">
            <h4 className="text-label-lg text-gold font-bold uppercase tracking-widest mb-8">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-body-md text-cream/60 transition-colors hover:text-gold inline-flex items-center group">
                    <span className="w-0 h-[1px] bg-gold mr-0 transition-all duration-300 group-hover:w-4 group-hover:mr-2" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Google Maps Embed */}
        <div className="mt-16 border-t border-cream/[0.06] pt-12">
          <h4 className="text-label-lg text-gold mb-6">Find Us</h4>
          <div className="overflow-hidden" style={{ height: 300 }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.6!2d-0.1541854!3d5.6368161!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9b00711e5fe3%3A0xacf0465ed89d6db2!2sDiz%20Eden%20luxury%20Apartments!5e0!3m2!1sen!2sgh!4v1712900000000"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Diz Eden location on Google Maps"
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-cream/[0.06] pt-8 md:flex-row">
          <p className="text-label-sm text-cream/30">
            © {new Date().getFullYear()} Diz Eden. All rights reserved.
          </p>
          <p className="text-label-sm text-cream/30">
            Premier Luxury Living — East Legon, Accra
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
