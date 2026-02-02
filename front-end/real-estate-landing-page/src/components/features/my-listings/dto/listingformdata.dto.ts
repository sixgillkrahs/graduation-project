export interface ListingFormData {
  // Step 1: Basic Info
  demandType: "SALE" | "RENT";
  propertyType: "APARTMENT" | "HOUSE" | "VILLA" | "LAND" | "STREET_HOUSE";
  projectName: string;
  title: string;
  description: string;

  // Step 2: Location
  province: string;

  ward: string;
  address: string;
  latitude: number | null;
  longitude: number | null;

  // Step 3: Features & Pricing
  area: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  direction: string;
  legalStatus: string;
  furniture: string;

  // Step 4: Media
  images: string[];
  thumbnail: string;
  videoLink?: string;
  virtualTourUrls?: string[];
}
