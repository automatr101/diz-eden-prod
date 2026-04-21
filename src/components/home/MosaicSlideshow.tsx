import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, viewportOnce } from "@/lib/animations";

const allImages = [
  "/gallery/DIZ EDEN-9.jpg", "/gallery/DIZ EDEN-11.jpg", "/gallery/DIZ EDEN-15.jpg", 
  "/gallery/DIZ EDEN-18.jpg", "/gallery/DIZ EDEN-21.jpg", "/gallery/DIZ EDEN-36.jpg", 
  "/gallery/DIZ EDEN-39.jpg", "/gallery/DIZ EDEN-41.jpg", "/gallery/DIZ EDEN-43.jpg", 
  "/gallery/DIZ EDEN-51.jpg", "/gallery/DIZ EDEN-55.jpg", "/gallery/DIZ EDEN-57.jpg", 
  "/gallery/DIZ EDEN-59.jpg", "/gallery/DIZ EDEN-60.jpg", "/gallery/DIZ EDEN-62.jpg", 
  "/gallery/DIZ EDEN-71.jpg", "/gallery/DIZ EDEN-78.jpg", "/gallery/DIZ EDEN-85.jpg", 
  "/gallery/DIZ EDEN-89.jpg", "/gallery/DIZ EDEN-99.jpg", "/gallery/DIZ EDEN-100.jpg", 
  "/gallery/DIZ EDEN-109.jpg", "/gallery/DIZ EDEN-111.jpg", "/gallery/DIZ EDEN-118.jpg", 
  "/gallery/DIZ EDEN-126.jpg", "/gallery/DIZ EDEN-127.jpg", "/gallery/DIZ EDEN-129.jpg", 
  "/gallery/DIZ EDEN-133.jpg", "/gallery/DIZ EDEN-135.jpg", "/gallery/DIZ EDEN-138.jpg", 
  "/gallery/DIZ EDEN-142.jpg", "/gallery/DIZ EDEN-147.jpg", "/gallery/DIZ EDEN-153.jpg", 
  "/gallery/DIZ EDEN-160.jpg", "/gallery/DIZ EDEN-164.jpg", "/gallery/DIZ EDEN-166.jpg", 
  "/gallery/DIZ EDEN-169.jpg", "/gallery/DIZ EDEN-171.jpg", "/gallery/DIZ EDEN-174.jpg", 
  "/gallery/DIZ EDEN-177.jpg", "/gallery/DIZ EDEN-182.jpg", "/gallery/DIZ EDEN-187.jpg"
];

const GRID_SIZE = 16; // 4x4

export default function MosaicSlideshow() {
  // Initialize grid with first 16 images
  const [gridImages, setGridImages] = useState(allImages.slice(0, GRID_SIZE));
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random cell to update
      const randomIndex = Math.floor(Math.random() * GRID_SIZE);
      
      // Pick a random image from the pool that isn't currently in the grid
      const currentGridSet = new Set(gridImages);
      const remainingPool = allImages.filter(img => !currentGridSet.has(img));
      
      if (remainingPool.length > 0) {
        const nextImage = remainingPool[Math.floor(Math.random() * remainingPool.length)];
        
        setGridImages(prev => {
          const newState = [...prev];
          newState[randomIndex] = nextImage;
          return newState;
        });
      }
    }, 3000); // Update one cell every 3 seconds

    return () => clearInterval(interval);
  }, [gridImages]);

  return (
    <section className="bg-eden py-16 sm:py-24 overflow-hidden border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 lg:px-16 mb-10 sm:mb-16 text-center">
        <motion.h2 
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
          className="text-display-md sm:text-display-lg text-white mb-4 sm:mb-6"
        >
          Living <span className="text-gold italic">Mosaic</span>
        </motion.h2>
        <motion.p 
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
          className="text-cream/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-light"
        >
          Watch the artistry of Diz Eden unfold in this dynamic, ever-changing visual narrative.
        </motion.p>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-4 aspect-square">
          {gridImages.map((img, idx) => (
            <div key={idx} className="relative overflow-hidden group bg-eden">
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={img}
                  src={img}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
