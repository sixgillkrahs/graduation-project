export const PropertiesEndpoint = {
  GetPropertiesPending: () => "/properties/status/pending",
  GetPropertiesRejected: () => "/properties/status/rejected",
  GetPropertyDetail: (id: string) => `/properties/${id}`,
  UpdateProperty: (id: string) => `/properties/${id}`,
  ApproveProperty: (id: string) => `/properties/${id}/approve`,
  RejectProperty: (id: string) => `/properties/${id}/reject`,
} as const;

export const PropertiesQueryKey = {
  GetPropertiesPending: "GetPropertiesPending",
  GetPropertiesRejected: "GetPropertiesRejected",
  GetPropertyDetail: "GetPropertyDetail",
  ApproveProperty: "ApproveProperty",
  RejectProperty: "RejectProperty",
} as const;
