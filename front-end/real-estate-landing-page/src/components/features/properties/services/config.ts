export const PropertyEndpoint = {
  onSale: () => `/properties/on-sale`,
  getById: (id: string) => `/properties/${id}/view`,
  increaseView: (id: string) => `/properties/${id}/view`,
  interact: (id: string) => `/properties/${id}/interact`,
} as const;

export const PropertyQueryKey = {
  onSale: "onSale",
  detail: "propertyDetail",
} as const;
