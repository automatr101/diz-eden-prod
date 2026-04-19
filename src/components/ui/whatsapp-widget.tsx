import { motion } from "framer-motion";

export default function WhatsAppWidget() {
  const whatsappUrl = "https://wa.link/aboffc";

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[100] group"
      aria-label="Chat on WhatsApp"
    >
      <div className="relative">
        {/* Pulse effect */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
        
        <div className="relative bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_30px_-5px_rgba(37,211,102,0.5)] border border-white/20 transition-all duration-300 group-hover:bg-[#128C7E] flex items-center justify-center">
          {/* Official WhatsApp Brand SVG */}
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .062 5.388.059 11.992c0 2.11.543 4.17 1.576 5.955L0 24l6.152-1.613a11.82 11.82 0 005.891 1.569h.005c6.604 0 11.987-5.389 11.99-11.993a11.847 11.847 0 00-3.623-8.47" />
          </svg>
        </div>

        {/* Tooltip */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-eden px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap">
          Chat with Concierge
        </div>
      </div>
    </motion.a>
  );
}
