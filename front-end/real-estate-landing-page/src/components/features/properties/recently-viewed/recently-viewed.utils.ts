import { mapPropertyToCompareItem } from "../compare/compare.utils";
import type { PropertyDto } from "../dto/property.dto";
import {
  PROPERTY_RECENTLY_VIEWED_MAX_ITEMS,
  type RecentlyViewedProperty,
} from "./recently-viewed.types";

const FALLBACK_IMAGE = "/placeholder.jpg";

export const mapPropertyToRecentlyViewed = (
  property: PropertyDto & { isFavorite?: boolean },
): RecentlyViewedProperty => {
  return {
    id: property._id,
    title: property.title,
    image:
      property.media?.thumbnail ||
      property.media?.images?.[0] ||
      FALLBACK_IMAGE,
    price: property.features?.price || 0,
    currency: property.features?.currency || "VND",
    unit: property.features?.priceUnit || "month",
    address: property.location?.address || "",
    province: property.location?.province || "",
    ward: property.location?.ward || "",
    specs: {
      beds: property.features?.bedrooms || 0,
      baths: property.features?.bathrooms || 0,
      area: property.features?.area || 0,
    },
    badges: {
      aiRecommended: false,
      tour3D: (property.media?.virtualTourUrls?.length || 0) > 0,
    },
    agent: {
      name: property.userId?.fullName || "",
      avatar: property.userId?.avatarUrl,
    },
    postedAt: property.createdAt,
    type: property.demandType === "sale" ? "sale" : "rent",
    isFavorite: Boolean(property.isFavorite),
    compareItem: mapPropertyToCompareItem(property),
    viewedAt: new Date().toISOString(),
  };
};

export const normalizeRecentlyViewedProperties = (
  value: unknown,
): RecentlyViewedProperty[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is RecentlyViewedProperty => {
      return Boolean(
        item &&
          typeof item === "object" &&
          "id" in item &&
          typeof item.id === "string" &&
          "title" in item &&
          typeof item.title === "string" &&
          "viewedAt" in item &&
          typeof item.viewedAt === "string" &&
          "compareItem" in item &&
          item.compareItem &&
          typeof item.compareItem === "object",
      );
    })
    .sort(
      (left, right) =>
        new Date(right.viewedAt).getTime() - new Date(left.viewedAt).getTime(),
    )
    .slice(0, PROPERTY_RECENTLY_VIEWED_MAX_ITEMS);
};

export const upsertRecentlyViewedProperty = ({
  items,
  item,
}: {
  items: RecentlyViewedProperty[];
  item: RecentlyViewedProperty;
}) => {
  return normalizeRecentlyViewedProperties([
    item,
    ...items.filter((existingItem) => existingItem.id !== item.id),
  ]);
};
