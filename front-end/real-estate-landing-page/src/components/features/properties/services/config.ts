export const PropertyEndpoint = {
  onSale: () => `/properties/on-sale`,
  favorites: () => `/properties/favorites`,
  getById: (id: string) => `/properties/${id}/view`,
  increaseView: (id: string) => `/properties/${id}/view`,
  interact: (id: string) => `/properties/${id}/interact`,
} as const;

export const PropertyQueryKey = {
  onSale: "onSale",
  favorites: "favorites",
  detail: "propertyDetail",
} as const;
