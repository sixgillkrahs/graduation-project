import type { PropertyDto, UserId } from "../dto/property.dto";

export type PropertySearchMode = "standard" | "semantic";

export interface SemanticPropertySearchFilters {
  demandType?: "SALE" | "RENT";
  propertyType?:
    | "APARTMENT"
    | "HOUSE"
    | "STREET_HOUSE"
    | "VILLA"
    | "LAND"
    | "OTHER";
  province?: string;
  district?: string;
  ward?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  amenities?: string[];
}

export interface SemanticPropertySearchRequest {
  query: string;
  limit: number;
  page: number;
  filters?: SemanticPropertySearchFilters;
  explain?: boolean;
}

export interface SemanticPropertySearchAppliedFilters
  extends SemanticPropertySearchFilters {}

export interface SemanticPropertySearchRetrieval {
  retrievedCandidates: number;
  matchedCandidates: number;
  rerankModel: string;
}

export interface SemanticPropertyMedia {
  images?: string[];
  thumbnail?: string;
  virtualTourUrls?: string[];
}

export interface SemanticPropertyUser extends UserId {
  isPro?: boolean;
  plan?: "BASIC" | "PRO";
}

export interface SemanticPropertyDto
  extends Omit<PropertyDto, "media" | "userId"> {
  media: SemanticPropertyMedia;
  userId: SemanticPropertyUser;
  isFavorite?: boolean;
}

export interface SemanticPropertySearchResult {
  property: SemanticPropertyDto;
  vectorScore: number;
  filterScore: number;
  rerankScore: number;
  finalScore: number;
  reasons: string[];
}

export interface SemanticPropertySearchResponseData {
  query: string;
  appliedFilters: SemanticPropertySearchAppliedFilters;
  retrieval: SemanticPropertySearchRetrieval;
  results: SemanticPropertySearchResult[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  answer?: string;
}

export interface SemanticSearchUrlState {
  query: string;
  page: number;
  limit: number;
  explain: boolean;
  filters: SemanticPropertySearchFilters;
}
