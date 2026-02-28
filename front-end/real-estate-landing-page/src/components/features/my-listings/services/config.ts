export const PropertyEndpoint = {
  getProperties: () => `/properties/me`,
  createProperty: () => `/properties`,
  updateProperty: (id: string) => `/properties/${id}`,
  getPropertyDetail: (id: string) => `/properties/${id}`,
};

export const PropertyKey = {
  getProperties: "getProperties",
  createProperty: "createProperty",
  updateProperty: "updateProperty",
  getPropertyDetail: "getPropertyDetail",
};
