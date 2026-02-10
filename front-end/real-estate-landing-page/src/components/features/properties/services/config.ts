export const PropertyEndpoint = {
  onSale: () => `/properties/on-sale`,
  getById: (id: string) => `/properties/${id}`,
} as const;

export const PropertyQueryKey = {
  onSale: "onSale",
  detail: "propertyDetail",
} as const;
