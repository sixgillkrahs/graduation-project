export const LandlordEndpoint = {
  GetLandlords: () => "/landlords",
  GetLandlordDetail: (id: string) => `/landlords/${id}`,
  CreateLandlord: () => "/landlords",
  DeleteLandlord: (id: string) => `/landlords/${id}`,
  UpdateLandlord: (id: string) => `/landlords/${id}`,
} as const;

export const LandlordQueryKey = {
  GetLandlords: "GetLandlords",
  GetLandlordDetail: "GetLandlordDetail",
} as const;
