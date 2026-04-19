import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import InteractiveBentoGallery, { MediaItemType } from "@/components/ui/interactive-bento-gallery";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Import pics folder images
import amenitiesImg from "@/assets/pics/amenities.jpg";
import bathroomImg from "@/assets/pics/bathroom.jpg";
import bedroomImg from "@/assets/pics/bedroom.jpg";
import detail1Img from "@/assets/pics/detail-1.jpg";
import exterior1Img from "@/assets/pics/exterior-1.jpg";
import heroMainImg from "@/assets/pics/hero-main.jpg";
import interior1Img from "@/assets/pics/interior-1.jpg";
import interior2Img from "@/assets/pics/interior-2.jpg";
import livingRoomImg from "@/assets/pics/living-room.jpg";

const mediaItems: MediaItemType[] = [
  {
    id: 1,
    type: "images",
    title: "The Grand Entrance",
    desc: "A warm and sophisticated welcome to your luxury stay.",
    url: ["/gallery/DIZ EDEN-9.jpg", exterior1Img, heroMainImg, "/gallery/DIZ EDEN-11.jpg"],
    span: "md:col-span-2 md:row-span-4 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 2,
    type: "images",
    title: "Living Spaces",
    desc: "Experience ultimate rest in our meticulously designed areas.",
    url: ["/gallery/DIZ EDEN-18.jpg", livingRoomImg, interior1Img, "/gallery/DIZ EDEN-36.jpg"],
    span: "md:col-span-2 md:row-span-2 col-span-1 sm:col-span-2 sm:row-span-2",
  },
  {
    id: 3,
    type: "images",
    title: "Culinary Arts",
    desc: "Fully equipped for your culinary adventures.",
    url: ["/gallery/DIZ EDEN-39.jpg", interior2Img, "/gallery/DIZ EDEN-55.jpg"],
    span: "md:col-span-1 md:row-span-3 sm:col-span-2 sm:row-span-2 ",
  },
  {
    id: 4,
    type: "images",
    title: "Serene Garden",
    desc: "Lush greenery meeting modern architecture.",
    url: ["/gallery/DIZ EDEN-100.jpg", "/gallery/DIZ EDEN-71.jpg", "/gallery/DIZ EDEN-126.jpg"],
    span: "md:col-span-1 md:row-span-2 sm:col-span-1 sm:row-span-2 ",
  },
  {
    id: 5,
    type: "images",
    title: "Sophisticated Dining",
    desc: "Perfect lighting for a relaxed evening meal.",
    url: ["/gallery/DIZ EDEN-109.jpg", "/gallery/DIZ EDEN-41.jpg", "/gallery/DIZ EDEN-43.jpg"],
    span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2 ",
  },
  {
    id: 6,
    type: "images",
    title: "Infinity Relaxation",
    desc: "Dive into luxury in our crystal clear rooftop pool.",
    url: ["/gallery/DIZ EDEN-133.jpg", "/gallery/DIZ EDEN-111.jpg", "/gallery/DIZ EDEN-142.jpg"],
    span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2 ",
  },
  {
    id: 7,
    type: "images",
    title: "Wellness & Spa",
    desc: "State-of-the-art fitness and relaxation facilities.",
    url: ["/gallery/DIZ EDEN-138.jpg", amenitiesImg, bathroomImg, "/gallery/DIZ EDEN-51.jpg"],
    span: "md:col-span-4 md:row-span-2 sm:col-span-1 sm:row-span-2 ",
  },
  {
    id: 8,
    type: "images",
    title: "Architectural Details",
    desc: "Every corner reflects our commitment to excellence.",
    url: ["/gallery/DIZ EDEN-15.jpg", detail1Img, "/gallery/DIZ EDEN-57.jpg"],
    span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2 ",
  },
  {
    id: 10,
    type: "images",
    title: "Night Scapes",
    desc: "The city lights reflecting off the infinity edges.",
    url: ["/gallery/DIZ EDEN-109.jpg", heroMainImg, "/gallery/DIZ EDEN-99.jpg"],
    span: "md:col-span-1 md:row-span-2 sm:col-span-1 sm:row-span-2 ",
  },
  {
    id: 11,
    type: "images",
    title: "The Master Suite",
    desc: "Sanctuary of peace and high-end comfort.",
    url: [bedroomImg, "/gallery/DIZ EDEN-43.jpg", "/gallery/DIZ EDEN-62.jpg"],
    span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2 ",
  },
];

const Gallery = () => {
  return (
    <div className="bg-eden min-h-screen">
      <Navbar />
      <main className="pt-32 pb-24 relative">
        <div className="container mx-auto px-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-cream/70 hover:text-gold transition-colors mb-12 group tracking-widest text-sm uppercase font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-gold font-bold tracking-[0.4em] uppercase text-xs mb-4 block">Visual Portfolio</span>
            <h1 className="text-5xl md:text-8xl font-display font-light text-white mb-6">
              A Gallery of <em className="font-light italic text-gold">Distinction</em>
            </h1>
            <p className="text-cream/60 text-lg max-w-2xl mx-auto leading-relaxed font-light">
              Explore the meticulous craftsmanship, serene environments, and unparalleled luxury that define the Diz Eden experience.
            </p>
          </motion.div>
          
          <InteractiveBentoGallery
            mediaItems={mediaItems}
            title=""
            description=""
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
