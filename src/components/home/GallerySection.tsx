import InteractiveBentoGallery, { MediaItemType } from "@/components/ui/interactive-bento-gallery";

const mediaItems: MediaItemType[] = [
  {
    id: 1,
    type: "image",
    title: "The Grand Entrance",
    desc: "A warm and sophisticated welcome to your luxury stay.",
    url: "/gallery/DIZ EDEN-9.jpg",
    span: "md:col-span-2 md:row-span-4 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 2,
    type: "image",
    title: "Master Suite Sanctuary",
    desc: "Experience ultimate rest in our meticulously designed master bedroom.",
    url: "/gallery/DIZ EDEN-18.jpg",
    span: "md:col-span-2 md:row-span-2 col-span-1 sm:col-span-2 sm:row-span-2",
  },
  {
    id: 3,
    type: "image",
    title: "Gourmet Kitchen",
    desc: "Fully equipped for your culinary adventures.",
    url: "/gallery/DIZ EDEN-39.jpg",
    span: "md:col-span-1 md:row-span-3 sm:col-span-2 sm:row-span-2 ",
  },
  {
    id: 4,
    type: "image",
    title: "Urban Oasis",
    desc: "Lush greenery meeting modern architecture.",
    url: "/gallery/DIZ EDEN-100.jpg",
    span: "md:col-span-1 md:row-span-2 sm:col-span-1 sm:row-span-2 ",
  },
  {
    id: 5,
    type: "image",
    title: "Evening Atmosphere",
    desc: "Perfect lighting for a relaxed evening.",
    url: "/gallery/DIZ EDEN-109.jpg",
    span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2 ",
  },
  {
    id: 6,
    type: "image",
    title: "Resort Style Pool",
    desc: "Dive into luxury in our crystal clear rooftop pool.",
    url: "/gallery/DIZ EDEN-133.jpg",
    span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2 ",
  },
  {
    id: 7,
    type: "image",
    title: "Wellness Sanctuary",
    desc: "State-of-the-art fitness and relaxation facilities.",
    url: "/gallery/DIZ EDEN-138.jpg",
    span: "md:col-span-4 md:row-span-2 sm:col-span-1 sm:row-span-2 ",
  },
  {
    id: 8,
    type: "image",
    title: "Detailing",
    desc: "Every corner reflects our commitment to excellence.",
    url: "/gallery/DIZ EDEN-15.jpg",
    span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2 ",
  },
];

export default function GallerySection() {
  return (
    <section id="gallery" className="bg-eden py-24 overflow-hidden border-t border-white/5">
      <div className="container mx-auto">
        <InteractiveBentoGallery
          mediaItems={mediaItems}
          title="Curated Visuals"
          description="Drag to organize or click to explore our stunning gallery of luxury living."
        />
      </div>
    </section>
  );
}

