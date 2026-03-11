export interface ListingState {
  currentStep: number;
  data: {
    demandType: "SALE" | "RENT";
    propertyType: "APARTMENT" | "HOUSE" | "VILLA" | "LAND" | "STREET_HOUSE";
    projectName: string;
    title?: string;
    location?: {
      province?: string;
      ward?: string;
      address?: string;
      latitude?: number | null;
      longitude?: number | null;
    };
    features?: {
      area?: string | number;
      price?: string | number;
      currency?: "VND" | "USD";
      priceUnit?: "VND" | "MILLION" | "BILLION" | "MILLION_PER_M2";
      bedrooms?: number;
      bathrooms?: number;
      direction?: string;
      legalStatus?: string;
      furniture?: string;
    };
    amenities?: string[];
    media?: {
      images: string[];
      thumbnail?: string;
      videoLink?: string;
      virtualTourUrls?: string[];
    };
    description?: string;
  };
}
