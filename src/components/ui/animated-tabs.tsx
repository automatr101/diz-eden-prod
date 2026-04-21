import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BouncingDots } from "@/components/ui/bouncing-dots";
import { Users, BedDouble, Star } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { supabase } from "@/integrations/supabase/client";

interface AnimatedTabsProps {
  className?: string;
}

const STAYS = [
  {
    id: "1br",
    label: "1 Bedroom Stay",
    badge: "Executive Suite",
    title: ["The Solo", "Stay"],
    titleHighlight: "Stay",
    priceGHS: 1200,
    description:
      "An intimate experience tailored for solo travelers or couples. Enjoy exclusive access to the master en-suite, fully equipped gourmet kitchen, and plush living spaces while the second room remains private.",
    image: "/gallery/DIZ EDEN-43.jpg",
    imageAlt: "1 Bedroom Suite at Diz Eden",
    chips: [
      { Icon: Users, label: "Up to 2 Guests" },
      { Icon: BedDouble, label: "King Suite" },
    ],
    chipStyle: "bg-white/5 border-white/10",
  },
  {
    id: "2br",
    label: "2 Bedroom Stay",
    badge: "Full Residence",
    title: ["Comprehensive", "Luxury"],
    titleHighlight: "Luxury",
    priceGHS: 1800,
    description:
      "The complete Diz Eden experience. Reclaim the entire residence for your group, featuring both en-suite master bedrooms, spacious common areas, and total privacy for your stay in East Legon, Accra.",
    image: "/gallery/DIZ EDEN-62.jpg",
    imageAlt: "Full 2 Bedroom Residence at Diz Eden",
    chips: [
      { Icon: Users, label: "Up to 4 Guests" },
      { Icon: BedDouble, label: "Two King Suites" },
    ],
    chipStyle: "bg-gold/10 border-gold/20",
  },
] as const;

const AnimatedTabs = ({ className }: AnimatedTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(STAYS[0].id);
  const [loading, setLoading] = useState(false);
  const { symbol, code, convert, isGhana } = useCurrency();
  const [prices, setPrices] = useState<{ '1br': number; '2br': number }>({ '1br': 1200, '2br': 1800 });

  useEffect(() => {
    async function fetchPrices() {
      const { data } = await supabase.from('settings').select('*').in('key', ['price_1br', 'price_2br']);
      if (data && data.length > 0) {
        const newPrices = { '1br': 1200, '2br': 1800 };
        data.forEach(item => {
           if (item.key === 'price_1br' && !isNaN(Number(item.value))) newPrices['1br'] = Number(item.value);
           if (item.key === 'price_2br' && !isNaN(Number(item.value))) newPrices['2br'] = Number(item.value);
        });
        setPrices(newPrices);
      }
    }
    fetchPrices();
  }, []);

  const handleTabChange = (id: string) => {
    if (id === activeTab) return;
    setLoading(true);
    setActiveTab(id);
    setTimeout(() => setLoading(false), 700);
  };

  const formatPrice = (priceGHS: number) => {
    const amount = convert(priceGHS);
    return `${symbol}${amount.toLocaleString()}`;
  };

  return (
    <div className={cn("w-full flex flex-col gap-y-6", className)}>
      {/* Tab Switcher */}
      <div className="grid grid-cols-2 bg-white/5 backdrop-blur-md p-1.5 rounded-2xl w-full max-w-sm mx-auto border border-white/10">
        {STAYS.map((stay) => (
          <button
            key={stay.id}
            onClick={() => handleTabChange(stay.id)}
            className={cn(
              "relative px-4 py-2.5 sm:px-8 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] rounded-xl outline-none transition-all duration-300",
              activeTab === stay.id ? "text-eden" : "text-white/50 hover:text-white"
            )}
          >
            {activeTab === stay.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-gold shadow-[0_10px_20px_-5px_rgba(212,175,55,0.4)] rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{stay.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="relative p-8 lg:p-12 bg-white/[0.02] shadow-2xl text-white backdrop-blur-sm rounded-[3rem] border border-white/5 min-h-[480px] overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-eden/40 backdrop-blur-[2px]"
            >
              <BouncingDots dots={3} />
            </motion.div>
          ) : (
            STAYS.filter((s) => s.id === activeTab).map((stay) => (
              <motion.div
                key={stay.id}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: "circInOut" }}
                className="h-full w-full grid md:grid-cols-2 gap-8 items-center"
              >
                {/* Image + Price Badge */}
                <div className="relative">
                  <img
                    src={stay.image}
                    alt={stay.imageAlt}
                    className="rounded-2xl w-full h-[380px] object-cover shadow-2xl border border-white/10"
                  />
                  {/* Price tag */}
                  <div className="absolute top-4 left-4 bg-gold px-4 py-2 rounded-xl text-eden font-bold text-sm shadow-xl flex flex-col items-start">
                    <span className="text-xl font-bold leading-none">
                      {formatPrice(prices[stay.id as '1br' | '2br'] || stay.priceGHS)}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest opacity-70 font-semibold mt-0.5">
                      {code} / Night
                    </span>
                  </div>
                  {/* Currency note for non-Ghana */}
                  {!isGhana && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm text-white/60 text-[10px] px-3 py-1.5 rounded-lg text-center">
                      ≈ Actual rate: GH₵{(prices[stay.id as '1br' | '2br'] || stay.priceGHS).toLocaleString()} · USD rate is approximate
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col gap-y-6">
                  <div className="flex items-center gap-2 text-gold">
                    <Star size={14} fill="currentColor" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                      {stay.badge}
                    </span>
                  </div>

                  <h2 className="text-5xl font-display font-light text-white leading-tight">
                    {stay.title[0]}
                    <br />
                    <em className="font-light italic text-gold">{stay.title[1]}</em>
                  </h2>

                  <p className="text-cream/80 leading-relaxed text-lg font-light">
                    {stay.description}
                  </p>

                  <div className="flex flex-row flex-wrap justify-center md:justify-start gap-2.5 sm:gap-4 pt-4 border-t border-white/5">
                    {stay.chips.map(({ Icon, label }) => (
                      <div
                        key={label}
                        className={cn("flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border whitespace-nowrap", stay.chipStyle)}
                      >
                        <Icon size={14} className="text-gold sm:w-[18px] sm:h-[18px]" />
                        <span className="text-[10px] sm:text-xs text-cream uppercase tracking-widest font-bold">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Book Now CTA */}
                  <div className="flex justify-center md:justify-start">
                    <a
                      href={`/booking?guests=${stay.id === "2br" ? 2 : 1}`}
                      className="mt-2 inline-flex items-center gap-3 bg-gold text-eden font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] px-8 py-3.5 sm:py-4 rounded-full w-full sm:w-fit justify-center hover:bg-white transition-all duration-300 hover:scale-105 shadow-[0_10px_20px_-5px_rgba(212,175,55,0.4)]"
                    >
                      Book This Stay
                    </a>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export { AnimatedTabs };
