import { IParamsPagination } from "@/@types/service";
import { useQuery } from "@tanstack/react-query";
import { PropertyKey } from "./config";
import PropertyService from "./service";

export const useGetMyProperties = (params?: IParamsPagination) => {
  return useQuery({
    queryKey: [PropertyKey.getProperties, params],
    queryFn: () => PropertyService.getProperties(params),
  });
};
