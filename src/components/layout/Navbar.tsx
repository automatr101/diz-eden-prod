import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/#residence", id: "residence" },
  { label: "Gallery", href: "/gallery", newTab: true },
  { label: "Experience", href: "/#experience", id: "experience" },
  { label: "About", href: "/#about", id: "about" },
  { label: "Contact", href: "/#contact", id: "contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);

      // Simple implementation of scroll spy
      if (location.pathname === "/") {
        const sections = navLinks
          .map(l => l.id)
          .filter(Boolean)
          .map(id => document.getElementById(id!));

        let currentSectionId = "";
        sections.forEach(section => {
          if (section) {
            const rect = section.getBoundingClientRect();
            // If the section is somewhat in the top portion of the viewport
            if (rect.top <= 150 && rect.bottom >= 150) {
              currentSectionId = section.id;
            }
          }
        });
        
        if (currentSectionId) {
          setActiveHash(`#${currentSectionId}`);
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial check
    return () => window.removeEventListener("scroll", onScroll);
  }, [location]);

  const isLinkActive = (href: string) => {
    if (href === "/gallery") return location.pathname === "/gallery";
    if (location.pathname === "/") {
      return activeHash === href.slice(1);
    }
    return false;
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          (scrolled || location.pathname !== "/")
            ? "bg-eden/95 backdrop-blur-md shadow-xl"
            : "bg-gradient-to-b from-black/80 via-black/40 to-transparent py-4"
        } rounded-t-[2rem] mx-2 mt-2`}
      >
        <div 
          className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-gold via-gold/50 to-eden/0 opacity-60" 
        />
        <div className="w-full flex items-center justify-between px-4 sm:px-8 py-2 md:py-3 lg:px-12">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative p-1 rounded-full border-2 border-gold shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all duration-500 bg-eden overflow-hidden">
              <img
                src="/logo.png"
                alt="Diz Eden"
                className={`transition-all duration-500 object-cover rounded-full ${scrolled ? 'h-9 w-9' : 'h-11 w-11 sm:h-14 sm:w-14'}`}
                style={{ objectPosition: 'center 35%', transform: 'scale(1.4)', transformOrigin: 'center 35%' }}
              />
            </div>
            {!scrolled && (
              <span className="ml-3 font-display text-white text-base sm:text-lg tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden sm:inline-block">
                Diz Eden
              </span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map((l) => {
              const active = isLinkActive(l.href);
              return (
                <a
                  key={l.label}
                  href={l.href}
                  target={l.newTab ? "_blank" : undefined}
                  rel={l.newTab ? "noopener noreferrer" : undefined}
                  className={cn(
                    "text-label-sm font-bold tracking-[0.1em] uppercase transition-all duration-500 relative group",
                    active 
                      ? "text-gold" 
                      : (scrolled ? "text-cream/80 hover:text-gold" : "text-white/90 hover:text-white hover:drop-shadow-md")
                  )}
                >
                  {l.label}
                  <span className={cn(
                    "absolute -bottom-1 left-0 h-[2px] bg-gold transition-all duration-300",
                    active ? "w-full" : "w-0 group-hover:w-full"
                  )} />
                </a>
              );
            })}
          </nav>

          {/* Book Now + Hamburger */}
          <div className="flex items-center gap-2 sm:gap-6">
            <a
              href="/#booking-bar"
              className="bg-gold px-3.5 py-2 sm:px-8 sm:py-3 rounded-full text-[8.5px] sm:text-label-sm font-bold tracking-[0.12em] sm:tracking-[0.15em] uppercase text-eden transition-all duration-500 hover:bg-white hover:scale-105 active:scale-95 shadow-[0_10px_20px_-10px_rgba(212,175,55,0.5)]"
            >
              Book Now
            </a>
            <button
              className="md:hidden text-cream p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} className="sm:w-[26px] sm:h-[26px]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-eden/95 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-8 py-6">
              <div className="p-1 rounded-full border border-gold/30 bg-eden">
                <img
                  src="/logo.png"
                  alt="Diz Eden"
                  className="h-12 w-12 rounded-full object-cover"
                  style={{ objectPosition: 'center 35%', transform: 'scale(1.4)', transformOrigin: 'center 35%' }}
                />
              </div>
              <button 
                onClick={() => setMenuOpen(false)} 
                className="p-3 rounded-full bg-white/5 text-cream hover:bg-gold hover:text-eden transition-all"
                aria-label="Close menu"
              >
                <X size={26} />
              </button>
            </div>
            <nav className="mt-12 flex flex-col items-center gap-8">
              {navLinks.map((l) => {
                const active = isLinkActive(l.href);
                return (
                  <a
                    key={l.label}
                    href={l.href}
                    target={l.newTab ? "_blank" : undefined}
                    rel={l.newTab ? "noopener noreferrer" : undefined}
                    className={cn(
                      "font-display text-4xl font-light transition-all",
                      active ? "text-gold tracking-widest" : "text-cream/90 hover:text-gold hover:tracking-widest"
                    )}
                    onClick={() => !l.newTab && setMenuOpen(false)}
                  >
                    {l.label}
                  </a>
                );
              })}
              <a
                href="/#booking-bar"
                className="mt-12 bg-gold px-10 py-4 rounded-full text-label-md font-bold tracking-widest text-eden transition-all hover:bg-white hover:scale-110"
                onClick={() => setMenuOpen(false)}
              >
                Book Now
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
