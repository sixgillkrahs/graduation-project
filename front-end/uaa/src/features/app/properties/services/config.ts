export const PropertiesEndpoint = {
  GetPropertiesPending: () => "/properties/status/pending",
  GetPropertyDetail: (id: string) => `/properties/${id}`,
  UpdateProperty: (id: string) => `/properties/${id}`,
} as const;

export const PropertiesQueryKey = {
  GetPropertiesPending: "GetPropertiesPending",
  GetPropertyDetail: "GetPropertyDetail",
} as const;
