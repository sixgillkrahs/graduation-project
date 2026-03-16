export const PROPERTY_SAVED_SEARCHES_MAX_ITEMS = 8;
export const PROPERTY_SAVED_SEARCHES_STORAGE_KEY =
  "havenly-property-saved-searches";

export interface PropertySavedSearch {
  id: string;
  name: string;
  queryString: string;
  createdAt: string;
  updatedAt: string;
}
