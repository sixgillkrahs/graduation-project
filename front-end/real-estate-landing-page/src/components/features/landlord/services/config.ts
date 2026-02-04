export const LandlordEndpoint = {
  GetLandlords: () => "/landlords",
  GetLandlordDetail: (id: string) => `/landlords/${id}`,
  CreateLandlord: () => "/landlords",
} as const;

export const LandlordQueryKey = {
  GetLandlords: "GetLandlords",
  GetLandlordDetail: "GetLandlordDetail",
} as const;
