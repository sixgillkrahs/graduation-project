import type { PropertyCompareItem } from "../compare/compare.types";

export const PROPERTY_RECENTLY_VIEWED_MAX_ITEMS = 6;
export const PROPERTY_RECENTLY_VIEWED_STORAGE_KEY =
  "havenly-recently-viewed-properties";

export interface RecentlyViewedProperty {
  id: string;
  title: string;
  image: string;
  price: number;
  currency: "VND" | "USD";
  unit: string;
  address: string;
  province: string;
  ward: string;
  specs: {
    beds: number;
    baths: number;
    area: number;
  };
  badges: {
    aiRecommended: boolean;
    tour3D: boolean;
  };
  agent: {
    name: string;
    avatar?: string;
  };
  postedAt: string;
  type: "rent" | "sale";
  isFavorite: boolean;
  compareItem: PropertyCompareItem;
  viewedAt: string;
}
