"use client"
import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react';
import { cn } from "@/lib/utils";

// MediaItemType defines the structure of a media item
export interface MediaItemType {
    id: number;
    type: string;
    title: string;
    desc: string;
    url: string | string[];
    span: string;
}
// MediaItem component renders either a video or image based on item.type, supporting cycling slideshows
const MediaItem = ({ item, className, onClick }: { item: MediaItemType, className?: string, onClick?: () => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isInView, setIsInView] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-cycle logic for image arrays
    useEffect(() => {
        if (item.type === 'images' && Array.isArray(item.url) && item.url.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % item.url.length);
            }, 4000 + Math.random() * 2000); // Random offset for organic feel
            return () => clearInterval(interval);
        }
    }, [item]);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                setIsInView(entry.isIntersecting);
            });
        }, options);

        if (videoRef.current) observer.observe(videoRef.current);
        return () => {
            if (videoRef.current) observer.unobserve(videoRef.current);
        };
    }, []);

    useEffect(() => {
        let mounted = true;
        const handleVideoPlay = async () => {
            if (!videoRef.current || !isInView || !mounted) return;
            try {
                if (videoRef.current.readyState >= 3) {
                    setIsBuffering(false);
                    await videoRef.current.play();
                } else {
                    setIsBuffering(true);
                    await new Promise((resolve) => {
                        if (videoRef.current) videoRef.current.oncanplay = resolve;
                    });
                    if (mounted) {
                        setIsBuffering(false);
                        await videoRef.current.play();
                    }
                }
            } catch (error) {
                console.warn("Video playback failed:", error);
            }
        };

        if (isInView) handleVideoPlay();
        else if (videoRef.current) videoRef.current.pause();

        return () => {
            mounted = false;
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.removeAttribute('src');
                videoRef.current.load();
            }
        };
    }, [isInView]);

    if (item.type === 'video') {
        return (
            <div className={cn(className, "relative overflow-hidden")}>
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    onClick={onClick}
                    playsInline
                    muted
                    loop
                    preload="auto"
                    style={{
                        opacity: isBuffering ? 0.8 : 1,
                        transition: 'opacity 0.2s',
                        transform: 'translateZ(0)',
                        willChange: 'transform',
                    }}
                >
                    <source src={typeof item.url === 'string' ? item.url : item.url[0]} type="video/mp4" />
                </video>
                {isBuffering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                )}
            </div>
        );
    }

    if (item.type === 'images' && Array.isArray(item.url)) {
        return (
            <div className={cn(className, "relative overflow-hidden cursor-pointer")} onClick={onClick}>
                <AnimatePresence mode="popLayout">
                    <motion.img
                        key={item.url[currentIndex]}
                        src={item.url[currentIndex]}
                        alt={item.title}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                    />
                </AnimatePresence>
            </div>
        );
    }

    return (
        <img
            src={typeof item.url === 'string' ? item.url : item.url[0]}
            alt={item.title}
            className={cn(className, "object-cover cursor-pointer")}
            onClick={onClick}
            loading="lazy"
            decoding="async"
        />
    );
};



// GalleryModal component displays the selected media item in a modal
interface GalleryModalProps {
    selectedItem: MediaItemType;
    isOpen: boolean;
    onClose: () => void;
    setSelectedItem: (item: MediaItemType | null) => void;
    mediaItems: MediaItemType[];
}
const GalleryModal = ({ selectedItem, isOpen, onClose, setSelectedItem, mediaItems }: GalleryModalProps) => {
    const [dockPosition, setDockPosition] = useState({ x: 0, y: 0 });
    const [modalIndex, setModalIndex] = useState(0);

    // Reset index when item changes
    useEffect(() => {
        setModalIndex(0);
    }, [selectedItem]);

    // Slideshow logic for modal if it's a multi-image item
    useEffect(() => {
        if (selectedItem.type === 'images' && Array.isArray(selectedItem.url) && selectedItem.url.length > 1) {
            const interval = setInterval(() => {
                setModalIndex((prev) => (prev + 1) % (selectedItem.url as string[]).length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedItem]);

    if (!isOpen) return null;

    const currentUrl = Array.isArray(selectedItem.url) ? selectedItem.url[modalIndex] : selectedItem.url;

    return (
        <>
            {/* Main Modal */}
            <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                }}
                className="fixed inset-0 w-full z-[100] flex items-center justify-center p-4 sm:p-10 backdrop-blur-2xl bg-eden/90"
            >
                {/* Main Content */}
                <div className="relative w-full max-w-6xl h-full flex flex-col justify-center">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/20">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${selectedItem.id}-${modalIndex}`}
                                className="w-full h-full"
                                initial={{ opacity: 0, filter: "blur(10px)" }}
                                animate={{ opacity: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, filter: "blur(10px)" }}
                                transition={{ duration: 0.3 }}
                                onClick={onClose}
                            >
                                {selectedItem.type === 'video' ? (
                                    <MediaItem item={selectedItem} className="w-full h-full object-contain" onClick={onClose} />
                                ) : (
                                    <img src={currentUrl} className="w-full h-full object-contain" alt={selectedItem.title} />
                                )}
                                
                                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 bg-gradient-to-t from-eden to-transparent">
                                    <h3 className="text-white text-2xl sm:text-4xl font-display font-light">
                                        {selectedItem.title}
                                    </h3>
                                    <p className="text-gold/80 text-sm sm:text-base mt-2 max-w-2xl tracking-wide uppercase font-semibold">
                                        {selectedItem.desc} {Array.isArray(selectedItem.url) && selectedItem.url.length > 1 && `(${modalIndex + 1}/${selectedItem.url.length})`}
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Close Button */}
                <motion.button
                    className="absolute top-6 right-6 p-3 rounded-full bg-white/5 text-white/70 hover:text-white border border-white/10 backdrop-blur-md"
                    onClick={onClose}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <X size={24} />
                </motion.button>

            </motion.div>

            {/* Draggable Dock */}
            <motion.div
                drag
                dragMomentum={false}
                dragElastic={0.1}
                initial={false}
                animate={{ x: dockPosition.x, y: dockPosition.y }}
                onDragEnd={(_, info) => {
                    setDockPosition(prev => ({
                        x: prev.x + info.offset.x,
                        y: prev.y + info.offset.y
                    }));
                }}
                className="fixed z-[110] left-1/2 bottom-8 -translate-x-1/2 touch-none"
            >
                <motion.div
                    className="relative rounded-2xl bg-eden-green/20 backdrop-blur-2xl border border-gold/20 shadow-2xl cursor-grab active:cursor-grabbing p-2"
                >
                    <div className="flex items-center -space-x-1 px-2 py-1">
                        {mediaItems.slice(0, 10).map((item, index) => (
                            <motion.div
                                key={item.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedItem(item);
                                }}
                                style={{
                                    zIndex: selectedItem.id === item.id ? 30 : mediaItems.length - index,
                                }}
                                className={cn(
                                    "relative group w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer",
                                    selectedItem.id === item.id ? 'ring-2 ring-gold shadow-lg shadow-gold/20' : 'hover:ring-2 hover:ring-gold/30'
                                )}
                                animate={{
                                    scale: selectedItem.id === item.id ? 1.25 : 1,
                                    y: selectedItem.id === item.id ? -10 : 0,
                                }}
                                whileHover={{
                                    scale: 1.3,
                                    y: -15,
                                    transition: { type: "spring", stiffness: 400, damping: 25 }
                                }}
                            >
                                <MediaItem item={item} className="w-full h-full" onClick={() => setSelectedItem(item)} />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/10" />
                                {selectedItem.id === item.id && (
                                    <motion.div
                                        layoutId="activeGlow"
                                        className="absolute -inset-2 bg-gold/20 blur-xl"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
};



interface InteractiveBentoGalleryProps {
    mediaItems: MediaItemType[]
    title: string
    description: string

}

const InteractiveBentoGallery: React.FC<InteractiveBentoGalleryProps> = ({ mediaItems, title, description }) => {
    const [selectedItem, setSelectedItem] = useState<MediaItemType | null>(null);
    const [items, setItems] = useState(mediaItems);
    const [isDragging, setIsDragging] = useState(false);

    return (
        <div className="mx-auto max-w-7xl px-6 lg:px-16 py-24">
            <div className="mb-16 text-center">
                <motion.h1
                    className="text-4xl sm:text-5xl md:text-7xl font-display font-light text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {title}
                </motion.h1>
                <motion.p
                    className="mt-6 text-lg sm:text-xl text-cream/50 max-w-2xl mx-auto leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {description}
                </motion.p>
            </div>
            <AnimatePresence mode="wait">
                {selectedItem ? (
                    <GalleryModal
                        selectedItem={selectedItem}
                        isOpen={true}
                        onClose={() => setSelectedItem(null)}
                        setSelectedItem={setSelectedItem}
                        mediaItems={items}
                    />
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[120px]"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.05 }
                            }
                        }}
                    >
                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                layoutId={`media-${item.id}`}
                                className={cn("relative overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing border border-white/5 shadow-xl", item.span)}
                                onClick={() => !isDragging && setSelectedItem(item)}
                                variants={{
                                    hidden: { y: 20, opacity: 0 },
                                    visible: {
                                        y: 0,
                                        opacity: 1,
                                        transition: {
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 25,
                                            delay: index * 0.02
                                        }
                                    }
                                }}
                                whileHover={{ scale: 1.02, border: "rgba(235, 185, 93, 0.3) 1px solid" }}
                                drag
                                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                dragElastic={0.8}
                                onDragStart={() => setIsDragging(true)}
                                onDragEnd={(e, info) => {
                                    setIsDragging(false);
                                    const moveDistance = info.offset.x + info.offset.y;
                                    if (Math.abs(moveDistance) > 100) {
                                        const newItems = [...items];
                                        const draggedItem = newItems[index];
                                        const targetIndex = moveDistance > 0 ?
                                            Math.min(index + 1, items.length - 1) :
                                            Math.max(index - 1, 0);
                                        newItems.splice(index, 1);
                                        newItems.splice(targetIndex, 0, draggedItem);
                                        setItems(newItems);
                                    }
                                }}
                            >
                                <MediaItem
                                    item={item}
                                    className="absolute inset-0 w-full h-full"
                                    onClick={() => !isDragging && setSelectedItem(item)}
                                />
                                <motion.div
                                    className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-eden/90 via-eden/20 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100"
                                >
                                    <h3 className="text-white text-sm font-display font-medium leading-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-gold/80 text-[10px] uppercase tracking-widest font-bold mt-1">
                                        {item.desc}
                                    </p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default InteractiveBentoGallery
