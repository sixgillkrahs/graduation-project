import {
  PROPERTY_SAVED_SEARCHES_MAX_ITEMS,
  type PropertySavedSearch,
} from "./saved-search.types";

const createSavedSearchId = () =>
  `saved-search-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const normalizeSavedSearches = (
  value: unknown,
): PropertySavedSearch[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is PropertySavedSearch => {
      return Boolean(
        item &&
          typeof item === "object" &&
          "id" in item &&
          typeof item.id === "string" &&
          "name" in item &&
          typeof item.name === "string" &&
          "queryString" in item &&
          typeof item.queryString === "string" &&
          "createdAt" in item &&
          typeof item.createdAt === "string" &&
          "updatedAt" in item &&
          typeof item.updatedAt === "string",
      );
    })
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() -
        new Date(left.updatedAt).getTime(),
    )
    .slice(0, PROPERTY_SAVED_SEARCHES_MAX_ITEMS);
};

export const upsertSavedSearch = ({
  items,
  name,
  queryString,
  existingId,
}: {
  items: PropertySavedSearch[];
  name: string;
  queryString: string;
  existingId?: string;
}) => {
  const now = new Date().toISOString();
  const existingItem = items.find(
    (item) => item.id === existingId || item.queryString === queryString,
  );

  const nextItem: PropertySavedSearch = {
    id: existingItem?.id || createSavedSearchId(),
    name: name.trim(),
    queryString,
    createdAt: existingItem?.createdAt || now,
    updatedAt: now,
  };

  return [nextItem, ...items.filter((item) => item.id !== nextItem.id)].slice(
    0,
    PROPERTY_SAVED_SEARCHES_MAX_ITEMS,
  );
};

export const countSavedSearchCriteria = (queryString: string) => {
  return Array.from(new URLSearchParams(queryString).keys()).filter(
    (key) => key !== "page" && key !== "limit" && key !== "tab",
  ).length;
};
