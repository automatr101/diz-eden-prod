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
  tagline: "1-Bedroom Suite in East Legon",
  description: "A private 1-bedroom suite in East Legon, Accra, ideal for solo travelers or couples — with a king bed, en-suite bathroom, private workspace, high-speed Wi-Fi, and daily housekeeping.",
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
  tagline: "2-Bedroom Residence in East Legon",
  description: "A 2-bedroom residence in East Legon, Accra, with two en-suite king bedrooms, a gourmet kitchen, and a private balcony — suited to families or groups of up to 4 guests.",
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
export const apartment = apartment2BR;
