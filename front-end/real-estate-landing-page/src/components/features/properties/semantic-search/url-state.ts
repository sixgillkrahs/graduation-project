import type { IParamsPagination } from "@/@types/service";
import type {
  SemanticPropertySearchFilters,
  SemanticPropertySearchRequest,
  SemanticSearchUrlState,
} from "./types";

export const SEMANTIC_SEARCH_MODE = "semantic";
export const DEFAULT_SEMANTIC_LIMIT = 8;
export const DEFAULT_SEMANTIC_PAGE = 1;

const AI_PARAM_KEYS = {
  query: "aiQuery",
  page: "aiPage",
  limit: "aiLimit",
  explain: "aiExplain",
  demandType: "aiDemandType",
  propertyType: "aiPropertyType",
  province: "aiProvince",
  district: "aiDistrict",
  ward: "aiWard",
  minPrice: "aiMinPrice",
  maxPrice: "aiMaxPrice",
  minArea: "aiMinArea",
  maxArea: "aiMaxArea",
  minBedrooms: "aiMinBedrooms",
  minBathrooms: "aiMinBathrooms",
  amenities: "aiAmenities",
} as const;

type SearchParamReader = {
  get: (key: string) => string | null;
};

const parseOptionalNumber = (value: string | null) => {
  if (!value) {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

export const normalizeSemanticFilters = (
  filters?: SemanticPropertySearchFilters,
): SemanticPropertySearchFilters => {
  const normalizedFilters: SemanticPropertySearchFilters = {};

  if (filters?.demandType) {
    normalizedFilters.demandType = filters.demandType;
  }

  if (filters?.propertyType) {
    normalizedFilters.propertyType = filters.propertyType;
  }

  if (filters?.province?.trim()) {
    normalizedFilters.province = filters.province.trim();
  }

  if (filters?.district?.trim()) {
    normalizedFilters.district = filters.district.trim();
  }

  if (filters?.ward?.trim()) {
    normalizedFilters.ward = filters.ward.trim();
  }

  if (typeof filters?.minPrice === "number" && filters.minPrice > 0) {
    normalizedFilters.minPrice = filters.minPrice;
  }

  if (typeof filters?.maxPrice === "number" && filters.maxPrice > 0) {
    normalizedFilters.maxPrice = filters.maxPrice;
  }

  if (typeof filters?.minArea === "number" && filters.minArea > 0) {
    normalizedFilters.minArea = filters.minArea;
  }

  if (typeof filters?.maxArea === "number" && filters.maxArea > 0) {
    normalizedFilters.maxArea = filters.maxArea;
  }

  if (typeof filters?.minBedrooms === "number" && filters.minBedrooms > 0) {
    normalizedFilters.minBedrooms = filters.minBedrooms;
  }

  if (typeof filters?.minBathrooms === "number" && filters.minBathrooms > 0) {
    normalizedFilters.minBathrooms = filters.minBathrooms;
  }

  const amenities = filters?.amenities?.filter(Boolean) || [];
  if (amenities.length > 0) {
    normalizedFilters.amenities = amenities;
  }

  return normalizedFilters;
};

export const parseSemanticSearchState = (
  searchParams: SearchParamReader,
): SemanticSearchUrlState => {
  const query = searchParams.get(AI_PARAM_KEYS.query)?.trim() || "";
  const explain = searchParams.get(AI_PARAM_KEYS.explain) === "1";
  const page = Math.min(
    50,
    Math.max(
      DEFAULT_SEMANTIC_PAGE,
      Number(searchParams.get(AI_PARAM_KEYS.page) || DEFAULT_SEMANTIC_PAGE),
    ),
  );
  const limit = Math.min(
    20,
    Math.max(
      1,
      Number(searchParams.get(AI_PARAM_KEYS.limit) || DEFAULT_SEMANTIC_LIMIT),
    ),
  );

  return {
    query,
    page,
    limit,
    explain,
    filters: normalizeSemanticFilters({
      demandType:
        (searchParams.get(AI_PARAM_KEYS.demandType) as
          | "SALE"
          | "RENT"
          | null) || undefined,
      propertyType:
        (searchParams.get(AI_PARAM_KEYS.propertyType) as
          | "APARTMENT"
          | "HOUSE"
          | "STREET_HOUSE"
          | "VILLA"
          | "LAND"
          | "OTHER"
          | null) || undefined,
      province: searchParams.get(AI_PARAM_KEYS.province) || undefined,
      district: searchParams.get(AI_PARAM_KEYS.district) || undefined,
      ward: searchParams.get(AI_PARAM_KEYS.ward) || undefined,
      minPrice: parseOptionalNumber(searchParams.get(AI_PARAM_KEYS.minPrice)),
      maxPrice: parseOptionalNumber(searchParams.get(AI_PARAM_KEYS.maxPrice)),
      minArea: parseOptionalNumber(searchParams.get(AI_PARAM_KEYS.minArea)),
      maxArea: parseOptionalNumber(searchParams.get(AI_PARAM_KEYS.maxArea)),
      minBedrooms: parseOptionalNumber(
        searchParams.get(AI_PARAM_KEYS.minBedrooms),
      ),
      minBathrooms: parseOptionalNumber(
        searchParams.get(AI_PARAM_KEYS.minBathrooms),
      ),
      amenities:
        searchParams
          .get(AI_PARAM_KEYS.amenities)
          ?.split(",")
          .map((item) => item.trim())
          .filter(Boolean) || [],
    }),
  };
};

export const buildSemanticSearchQueryString = (
  state: SemanticSearchUrlState,
) => {
  const queryParams = new URLSearchParams();
  queryParams.set("mode", SEMANTIC_SEARCH_MODE);

  if (state.query.trim()) {
    queryParams.set(AI_PARAM_KEYS.query, state.query.trim());
  }

  if (state.page !== DEFAULT_SEMANTIC_PAGE) {
    queryParams.set(AI_PARAM_KEYS.page, String(state.page));
  }

  if (state.limit !== DEFAULT_SEMANTIC_LIMIT) {
    queryParams.set(AI_PARAM_KEYS.limit, String(state.limit));
  }

  if (state.explain) {
    queryParams.set(AI_PARAM_KEYS.explain, "1");
  }

  const filters = normalizeSemanticFilters(state.filters);

  if (filters.demandType) {
    queryParams.set(AI_PARAM_KEYS.demandType, filters.demandType);
  }

  if (filters.propertyType) {
    queryParams.set(AI_PARAM_KEYS.propertyType, filters.propertyType);
  }

  if (filters.province) {
    queryParams.set(AI_PARAM_KEYS.province, filters.province);
  }

  if (filters.district) {
    queryParams.set(AI_PARAM_KEYS.district, filters.district);
  }

  if (filters.ward) {
    queryParams.set(AI_PARAM_KEYS.ward, filters.ward);
  }

  if (typeof filters.minPrice === "number") {
    queryParams.set(AI_PARAM_KEYS.minPrice, String(filters.minPrice));
  }

  if (typeof filters.maxPrice === "number") {
    queryParams.set(AI_PARAM_KEYS.maxPrice, String(filters.maxPrice));
  }

  if (typeof filters.minArea === "number") {
    queryParams.set(AI_PARAM_KEYS.minArea, String(filters.minArea));
  }

  if (typeof filters.maxArea === "number") {
    queryParams.set(AI_PARAM_KEYS.maxArea, String(filters.maxArea));
  }

  if (typeof filters.minBedrooms === "number") {
    queryParams.set(AI_PARAM_KEYS.minBedrooms, String(filters.minBedrooms));
  }

  if (typeof filters.minBathrooms === "number") {
    queryParams.set(AI_PARAM_KEYS.minBathrooms, String(filters.minBathrooms));
  }

  if (filters.amenities?.length) {
    queryParams.set(AI_PARAM_KEYS.amenities, filters.amenities.join(","));
  }

  return queryParams.toString();
};

export const buildSemanticSearchRequest = (
  state: SemanticSearchUrlState,
): SemanticPropertySearchRequest => ({
  query: state.query.trim(),
  page: state.page,
  limit: state.limit,
  filters: normalizeSemanticFilters(state.filters),
  explain: state.explain,
});

export const hasSemanticQuery = (state: SemanticSearchUrlState) =>
  state.query.trim().length >= 2;

export const buildSemanticStateFromStandardParams = (
  params: IParamsPagination,
): SemanticSearchUrlState => {
  const query = typeof params.query === "string" ? params.query.trim() : "";

  return {
    query,
    page: DEFAULT_SEMANTIC_PAGE,
    limit: DEFAULT_SEMANTIC_LIMIT,
    explain: false,
    filters: normalizeSemanticFilters({
      demandType:
        params.demandType === "SALE" || params.demandType === "RENT"
          ? params.demandType
          : undefined,
      propertyType:
        typeof params.propertyType === "string"
          ? (params.propertyType as SemanticPropertySearchFilters["propertyType"])
          : undefined,
      minBedrooms:
        typeof params.minBedrooms === "number"
          ? params.minBedrooms
          : typeof params["features.bedrooms"] === "number"
            ? params["features.bedrooms"]
            : undefined,
      minBathrooms:
        typeof params.minBathrooms === "number"
          ? params.minBathrooms
          : typeof params["features.bathrooms"] === "number"
            ? params["features.bathrooms"]
            : undefined,
    }),
  };
};
