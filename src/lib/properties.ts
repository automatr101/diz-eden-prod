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

export const apartment1BR: Property = {
  slug: "diz-eden-luxury-1br",
  name: "Diz Eden 1-Bedroom Luxury Suite",
  tagline: "Intimate Elegance in East Legon",
  description: "Perfect for business travelers or couples, our 1-bedroom suite offers the same premium amenities and sophisticated design as our larger residences, providing a private sanctuary of peace and comfort.",
  bedrooms: 1,
  bathrooms: 1,
  maxGuests: 2,
  floorArea: 65,
  basePrice: 1200,
  cleaningFee: 150,
  image: interior1,
  amenities: ["King sized bed", "En-suite bathroom", "Private workspace", "Designer living area", "High-speed Wi-Fi", "Smart TV with Netflix", "Air conditioning", "24/7 Security", "Private parking", "Daily housekeeping"],
};

export const apartment2BR: Property = {
  slug: "diz-eden-luxury-2br",
  name: "Diz Eden 2-Bedroom Luxury Residence",
  tagline: "Sophisticated Sanctuary in East Legon",
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

export const properties: Property[] = [apartment1BR, apartment2BR];
