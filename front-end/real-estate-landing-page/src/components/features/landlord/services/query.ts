import { useQuery } from "@tanstack/react-query";
import { LandlordQueryKey } from "./config";
import LandlordService from "./service";
import { IParamsPagination } from "@/@types/service";

export const useLandlords = (pagination: IParamsPagination) => {
  return useQuery({
    queryKey: [LandlordQueryKey.GetLandlords, pagination],
    queryFn: () => LandlordService.getLandlords(pagination),
  });
};

export const useLandlordDetail = (id: string) => {
  return useQuery({
    queryKey: [LandlordQueryKey.GetLandlordDetail, id],
    queryFn: () => LandlordService.getLandlordDetail(id),
    enabled: !!id,
  });
};

import PropertyService from "@/components/features/my-listings/services/service";

export const useLandlordProperties = (
  userId: string,
  params: IParamsPagination,
) => {
  return useQuery({
    queryKey: [
      LandlordQueryKey.GetLandlordDetail,
      "properties",
      userId,
      params,
    ],
    queryFn: () =>
      PropertyService.getProperties({
        ...params,
        userId,
      }),
    enabled: !!userId,
  });
};
