import { ResourceQueryKey } from "./config";
import ResourceService from "./service";
import type { IParamsPagination } from "@shared/types/service";
import { useQuery } from "@tanstack/react-query";

export const useGetResources = (params: IParamsPagination) => {
  return useQuery({
    queryKey: [ResourceQueryKey.getResources, params],
    queryFn: () => ResourceService.getResources(params),
  });
};
