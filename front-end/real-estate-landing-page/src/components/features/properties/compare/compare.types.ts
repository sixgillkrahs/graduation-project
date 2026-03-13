export const PROPERTY_COMPARE_MAX_ITEMS = 4;
export const PROPERTY_COMPARE_MIN_ITEMS = 2;
export const PROPERTY_COMPARE_STORAGE_KEY = "havenly-property-compare";

export interface PropertyCompareItem {
  id: string;
  title: string;
  image: string;
  demandType: string;
  propertyType: string;
  price: number;
  currency: "VND" | "USD";
  priceUnit: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  direction: string;
  legalStatus: string;
  furniture: string;
  amenities: string[];
  address: string;
  province: string;
  ward: string;
  hasVirtualTour: boolean;
  agentName: string;
}
