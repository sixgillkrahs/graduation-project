import type { IParamsPagination } from "@/@types/service";
import type { SearchFilters } from "./components/AdvancedSearch";
import type { FilterValues } from "./components/FilterSidebar";

export type PropertyTabType = "all" | "favorites";

export const DEFAULT_PROPERTY_PARAMS: IParamsPagination = {
  page: 1,
  limit: 6,
};

export const FILTER_DIRECTION_MAP: Record<string, string> = {
  north: "NORTH",
  south: "SOUTH",
  east: "EAST",
  west: "WEST",
  northeast: "NORTH_EAST",
  northwest: "NORTH_WEST",
  southeast: "SOUTH_EAST",
  southwest: "SOUTH_WEST",
};

export const REVERSE_DIRECTION_MAP = Object.fromEntries(
  Object.entries(FILTER_DIRECTION_MAP).map(([key, value]) => [value, key]),
) as Record<string, string>;

const NUMBER_PARAM_KEYS = new Set([
  "page",
  "limit",
  "maxPrice",
  "features.bedrooms",
  "features.bathrooms",
  "minBedrooms",
  "minBathrooms",
]);

const ORDERED_FILTER_KEYS = [
  "query",
  "demandType",
  "propertyType",
  "maxPrice",
  "hasVirtualTour",
  "features.bedrooms",
  "features.bathrooms",
  "features.direction",
  "minBedrooms",
  "minBathrooms",
  "sortField",
  "sortOrder",
] as const;

export const buildParamsFromSearchParams = (
  searchParams: URLSearchParams,
): IParamsPagination => {
  const params: IParamsPagination = {
    page: Number(searchParams.get("page") || DEFAULT_PROPERTY_PARAMS.page),
    limit: Number(searchParams.get("limit") || DEFAULT_PROPERTY_PARAMS.limit),
  };

  ORDERED_FILTER_KEYS.forEach((key) => {
    const value = searchParams.get(key);
    if (!value) {
      return;
    }

    params[key] = NUMBER_PARAM_KEYS.has(key) ? Number(value) : value;
  });

  return params;
};

export const extractSearchFiltersFromParams = (
  params: IParamsPagination,
): SearchFilters => {
  const filters: SearchFilters = {};

  if (typeof params.query === "string" && params.query.trim()) {
    filters.query = params.query.trim();
  }

  if (typeof params.demandType === "string" && params.demandType.trim()) {
    filters.demandType = params.demandType;
  }

  if (typeof params.propertyType === "string" && params.propertyType.trim()) {
    filters.propertyType = params.propertyType;
  }

  if (typeof params.maxPrice === "number") {
    filters.maxPrice = params.maxPrice;
  }

  return filters;
};

export const extractSidebarFiltersFromParams = (
  params: IParamsPagination,
): FilterValues => {
  const filters: FilterValues = {};

  if (typeof params.minBedrooms === "number" && params.minBedrooms >= 4) {
    filters.minBedrooms = params.minBedrooms;
  } else if (typeof params["features.bedrooms"] === "number") {
    filters["features.bedrooms"] = params["features.bedrooms"];
  }

  if (typeof params.minBathrooms === "number" && params.minBathrooms >= 3) {
    filters.minBathrooms = params.minBathrooms;
  } else if (typeof params["features.bathrooms"] === "number") {
    filters["features.bathrooms"] = params["features.bathrooms"];
  }

  if (typeof params["features.direction"] === "string") {
    filters["features.direction"] = params["features.direction"];
  }

  return filters;
};

export const buildPropertyQueryString = ({
  params,
  tab = "all",
  includePage = true,
  includeLimit = true,
}: {
  params: IParamsPagination;
  tab?: PropertyTabType;
  includePage?: boolean;
  includeLimit?: boolean;
}) => {
  const nextParams = new URLSearchParams();

  if (tab === "favorites") {
    nextParams.set("tab", "favorites");
  }

  if (includePage && params.page !== DEFAULT_PROPERTY_PARAMS.page) {
    nextParams.set("page", String(params.page));
  }

  if (includeLimit && params.limit !== DEFAULT_PROPERTY_PARAMS.limit) {
    nextParams.set("limit", String(params.limit));
  }

  ORDERED_FILTER_KEYS.forEach((key) => {
    const value = params[key];

    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (typeof value === "number" && Number.isNaN(value))
    ) {
      return;
    }

    nextParams.set(key, String(value));
  });

  return nextParams.toString();
};
