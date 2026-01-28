export interface ListingFormData {
  // Step 1: Basic Info
  demandType: "SALE" | "RENT";
  propertyType: "APARTMENT" | "HOUSE" | "VILLA" | "LAND" | "STREET_HOUSE";
  projectName: string;

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
}

export const defaultFormValues: ListingFormData = {
  // Step 1
  demandType: "SALE",
  propertyType: "APARTMENT",
  projectName: "",

  // Step 2
  province: "",

  ward: "",
  address: "",
  latitude: null,
  longitude: null,

  // Step 3
  area: "",
  price: "",
  bedrooms: 1,
  bathrooms: 1,
  direction: "",
  legalStatus: "",
  furniture: "",

  // Step 4
  images: [],
};

// Field groups for step validation
export const stepFields = {
  step1: ["demandType", "propertyType", "projectName"] as const,
  step2: ["province", "ward", "address", "latitude", "longitude"] as const,
  step3: [
    "area",
    "price",
    "bedrooms",
    "bathrooms",
    "direction",
    "legalStatus",
    "furniture",
  ] as const,
  step4: ["images"] as const,
};
