import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PropertyQueryKey } from "./config";
import PropertyService from "./service";
import { IParamsPagination } from "@/@types/service";

export const useOnSale = (params: IParamsPagination) => {
  return useQuery({
    queryKey: [PropertyQueryKey.onSale, params],
    queryFn: () => PropertyService.onSale(params),
    placeholderData: keepPreviousData,
  });
};

export const useAgentOnSaleProperties = (
  agentId: string,
  params: IParamsPagination,
) => {
  return useQuery({
    queryKey: [PropertyQueryKey.agentOnSale, agentId, params],
    queryFn: () => PropertyService.agentOnSale(agentId, params),
    enabled: !!agentId,
    placeholderData: keepPreviousData,
  });
};

export const useFavoriteProperties = (params: IParamsPagination) => {
  return useQuery({
    queryKey: [PropertyQueryKey.favorites, params],
    queryFn: () => PropertyService.favorites(params),
    placeholderData: keepPreviousData,
    meta: { SUPPRESS_ERROR: true },
    retry: 0,
  });
};

export const usePropertyDetail = (id: string) => {
  return useQuery({
    queryKey: [PropertyQueryKey.detail, id],
    queryFn: () => PropertyService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
};

export const useRecommendedProperties = (id: string) => {
  return useQuery({
    queryKey: [PropertyQueryKey.recommended, id],
    queryFn: () => PropertyService.getRecommended(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 20,
  });
};
