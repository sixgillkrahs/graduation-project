import { findOptionLabel, LIST_PROVINCE, LIST_WARD } from "gra-helper";
import { getPropertyAmenityDisplay } from "@/lib/property-amenities";
import type { PropertyDto } from "../dto/property.dto";
import {
  PROPERTY_COMPARE_MAX_ITEMS,
  type PropertyCompareItem,
} from "./compare.types";

const FALLBACK_IMAGE = "/placeholder.jpg";

export const mapPropertyToCompareItem = (
  property: PropertyDto,
): PropertyCompareItem => {
  return {
    id: property._id,
    title: property.title,
    image:
      property.media?.thumbnail ||
      property.media?.images?.[0] ||
      FALLBACK_IMAGE,
    demandType: property.demandType,
    propertyType: property.propertyType,
    price: property.features?.price || 0,
    currency: property.features?.currency || "VND",
    priceUnit: property.features?.priceUnit || "month",
    area: property.features?.area || 0,
    bedrooms: property.features?.bedrooms || 0,
    bathrooms: property.features?.bathrooms || 0,
    direction: property.features?.direction || "",
    legalStatus: property.features?.legalStatus || "",
    furniture: property.features?.furniture || "",
    amenities: property.amenities || [],
    address: property.location?.address || "",
    province: property.location?.province || "",
    ward: property.location?.ward || "",
    hasVirtualTour: (property.media?.virtualTourUrls?.length || 0) > 0,
    agentName: property.userId?.fullName || "",
  };
};

export const buildCompareLocationLabel = (item: PropertyCompareItem) => {
  return [
    item.address,
    findOptionLabel(item.ward, LIST_WARD),
    findOptionLabel(item.province, LIST_PROVINCE),
  ]
    .filter(Boolean)
    .join(", ");
};

export const buildCompareAmenityLabels = (item: PropertyCompareItem) => {
  return item.amenities.map(
    (amenity) => getPropertyAmenityDisplay(amenity).label,
  );
};

export const normalizeStoredCompareItems = (
  value: unknown,
): PropertyCompareItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is PropertyCompareItem =>
      Boolean(
        item &&
          typeof item === "object" &&
          "id" in item &&
          typeof item.id === "string" &&
          "title" in item &&
          typeof item.title === "string",
      ),
    )
    .slice(0, PROPERTY_COMPARE_MAX_ITEMS);
};
