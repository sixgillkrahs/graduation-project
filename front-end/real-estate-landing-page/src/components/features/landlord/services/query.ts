import { useQuery } from "@tanstack/react-query";
import { LandlordQueryKey } from "./config";
import LandlordService from "./service";

export const useLandlords = () => {
  return useQuery({
    queryKey: [LandlordQueryKey.GetLandlords],
    queryFn: () => LandlordService.getLandlords(),
  });
};
