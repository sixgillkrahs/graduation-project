export const PropertyEndpoint = {
  getProperties: () => `/properties/me`,
  createProperty: () => `/properties`,
  updateProperty: (id: string) => `/properties/${id}`,
  updatePropertyStatus: (id: string) => `/properties/${id}/status`,
  getPropertyDetail: (id: string) => `/properties/${id}`,
};

export const PropertyKey = {
  getProperties: "getProperties",
  createProperty: "createProperty",
  updateProperty: "updateProperty",
  updatePropertyStatus: "updatePropertyStatus",
  getPropertyDetail: "getPropertyDetail",
};
