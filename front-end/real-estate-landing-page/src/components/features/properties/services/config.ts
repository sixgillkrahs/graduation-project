export const PropertyEndpoint = {
  onSale: () => `/properties/on-sale`,
  agentOnSale: (agentId: string) => `/properties/agent/${agentId}/on-sale`,
  favorites: () => `/properties/favorites`,
  getById: (id: string) => `/properties/${id}/view`,
  increaseView: (id: string) => `/properties/${id}/view`,
  interact: (id: string) => `/properties/${id}/interact`,
  recommended: (id: string) => `/properties/${id}/recommended`,
} as const;

export const PropertyQueryKey = {
  onSale: "onSale",
  agentOnSale: "agentOnSale",
  favorites: "favorites",
  detail: "propertyDetail",
  recommended: "recommendedProperties",
} as const;
