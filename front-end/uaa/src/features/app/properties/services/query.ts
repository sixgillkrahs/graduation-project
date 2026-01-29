import { PropertiesQueryKey } from "./config";
import PropertiesService from "./service";
import type { IParamsPagination } from "@shared/types/service";
import { useQuery } from "@tanstack/react-query";

export const useGetPropertiesPending = (params: IParamsPagination) => {
  return useQuery({
    queryKey: [PropertiesQueryKey.GetPropertiesPending, params],
    queryFn: () => PropertiesService.GetPropertiesPending(params),
  });
};

export const useGetPropertyDetail = (id: string) => {
  return useQuery({
    queryKey: [PropertiesQueryKey.GetPropertyDetail, id],
    queryFn: () => PropertiesService.GetPropertyDetail(id),
    enabled: !!id,
  });
};
