import { findOptionLabel, LIST_PROVINCE, LIST_WARD } from "gra-helper";
import type { PropertyDto } from "../dto/property.dto";
import type {
  SemanticPropertyDto,
  SemanticPropertySearchAppliedFilters,
} from "./types";

const DEFAULT_PROPERTY_IMAGE = "/placeholder.jpg";

const resolveProvinceLabel = (value?: string) =>
  value ? findOptionLabel(value, LIST_PROVINCE) || value : "";

const resolveWardLabel = (value?: string) =>
  value ? findOptionLabel(value, LIST_WARD) || value : "";

export const normalizeSemanticProperty = (
  property: SemanticPropertyDto,
): PropertyDto & { isFavorite: boolean } => ({
  _id: property._id,
  title: property.title || "Untitled property",
  description: property.description || "",
  projectName: property.projectName || "",
  demandType: property.demandType || "SALE",
  propertyType: property.propertyType || "OTHER",
  location: {
    coordinates: property.location?.coordinates || { lat: 0, long: 0 },
    province: property.location?.province || "",
    district: property.location?.district || "",
    ward: property.location?.ward || "",
    address: property.location?.address || "",
    hideAddress: property.location?.hideAddress ?? false,
  },
  features: {
    area: property.features?.area || 0,
    price: property.features?.price || 0,
    currency: property.features?.currency || "VND",
    priceUnit: property.features?.priceUnit || "VND",
    bedrooms: property.features?.bedrooms || 0,
    bathrooms: property.features?.bathrooms || 0,
    direction: property.features?.direction || "",
    furniture: property.features?.furniture || "",
    legalStatus: property.features?.legalStatus || "",
  },
  amenities: property.amenities || [],
  media: {
    images: property.media?.images || [],
    thumbnail:
      property.media?.thumbnail ||
      property.media?.images?.[0] ||
      DEFAULT_PROPERTY_IMAGE,
    virtualTourUrls: property.media?.virtualTourUrls || [],
  },
  userId: {
    _id: property.userId?._id || "",
    email: property.userId?.email || "",
    fullName: property.userId?.fullName || "",
    prefixPhone: property.userId?.prefixPhone || "",
    phone: property.userId?.phone || "",
    isActive: property.userId?.isActive ?? true,
    isDeleted: property.userId?.isDeleted ?? false,
    createdAt: property.userId?.createdAt || "",
    updatedAt: property.userId?.updatedAt || "",
    avatarUrl: property.userId?.avatarUrl || "",
    isPro: property.userId?.isPro,
    plan: property.userId?.plan,
  },
  status: property.status || "PUBLISHED",
  viewCount: property.viewCount || 0,
  createdAt: property.createdAt || "",
  updatedAt: property.updatedAt || "",
  isFavorite: Boolean(property.isFavorite),
});

export const formatSemanticAddress = (property: SemanticPropertyDto) => {
  return [
    property.location?.address,
    resolveWardLabel(property.location?.ward),
    property.location?.district,
    resolveProvinceLabel(property.location?.province),
  ]
    .filter(Boolean)
    .join(", ");
};

export const formatSemanticScoreLabel = (score?: number) => {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return "";
  }

  return `${Math.round(score * 100)}% match`;
};

export const hasAppliedFilters = (
  appliedFilters?: SemanticPropertySearchAppliedFilters,
) => {
  if (!appliedFilters) {
    return false;
  }

  return Object.values(appliedFilters).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== undefined && value !== null && value !== "";
  });
};
