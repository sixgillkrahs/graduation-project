export const PropertiesEndpoint = {
  GetPropertiesPending: () => "/properties/status/pending",
  GetPropertyDetail: (id: string) => `/properties/${id}`,
  UpdateProperty: (id: string) => `/properties/${id}`,
  ApproveProperty: (id: string) => `/properties/${id}/approve`,
  RejectProperty: (id: string) => `/properties/${id}/reject`,
} as const;

export const PropertiesQueryKey = {
  GetPropertiesPending: "GetPropertiesPending",
  GetPropertyDetail: "GetPropertyDetail",
  ApproveProperty: "ApproveProperty",
  RejectProperty: "RejectProperty",
} as const;
