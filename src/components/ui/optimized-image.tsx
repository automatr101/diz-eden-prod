import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: "video" | "square" | "portrait" | "auto" | string;
  lowResSrc?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className, 
  aspectRatio = "auto",
  loading = "lazy",
  decoding = "async",
  fetchPriority = "auto",
  lowResSrc,
  ...props 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const aspectStyles = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    auto: "",
  };

  const currentAspectClass = typeof aspectRatio === "string" && aspectRatio in aspectStyles 
    ? aspectStyles[aspectRatio as keyof typeof aspectStyles] 
    : "";

  return (
    <div className={cn(
      "relative overflow-hidden bg-white/5", 
      currentAspectClass,
      className
    )}>
      {/* Fallback/Low-res Placeholder */}
      <div 
        className={cn(
          "absolute inset-0 z-0 transition-opacity duration-1000 bg-eden",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
      >
        {lowResSrc && (
          <img 
            src={lowResSrc} 
            alt="" 
            className="h-full w-full object-cover blur-xl scale-110 opacity-50"
          />
        )}
      </div>

      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        // @ts-ignore - fetchPriority is supported in modern browsers but might not be in all React types yet
        fetchpriority={fetchPriority}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          "h-full w-full object-cover transition-all duration-700",
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
          error && "hidden"
        )}
        {...props}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-eden text-gold/30 text-[10px] uppercase tracking-widest font-bold">
          Image unavailable
        </div>
      )}
    </div>
  );
}
