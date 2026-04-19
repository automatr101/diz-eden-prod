import heroImg from "@/assets/pics/hero-main.jpg";
import interior1 from "@/assets/pics/interior-1.jpg";
import bedroomImg from "@/assets/pics/bedroom.jpg";

export interface Property {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  floorArea: number;
  basePrice: number;
  cleaningFee: number;
  image: string;
  amenities: string[];
}

export const apartment: Property = {
  slug: "diz-eden-luxury-2br",
  name: "Diz Eden Luxury Apartment",
  tagline: "Sophisticated 2-Bedroom Sanctuary in East Legon",
  description: "Experience the pinnacle of urban luxury in our meticulously designed 2-bedroom residence. Located in the heart of East Legon, this apartment combines modern aesthetics with the comforts of a high-end home, featuring expansive windows, custom furnishings, and premium finishes.",
  bedrooms: 2,
  bathrooms: 2,
  maxGuests: 4,
  floorArea: 120,
  basePrice: 1800,
  cleaningFee: 200,
  image: heroImg,
  amenities: ["King sized beds", "En-suite bathrooms", "Gourmet kitchen", "Designer living area", "High-speed Wi-Fi", "Smart TV with Netflix", "Air conditioning", "Private balcony", "24/7 Security", "Private parking", "Daily housekeeping"],
};

export const properties: Property[] = [apartment];
