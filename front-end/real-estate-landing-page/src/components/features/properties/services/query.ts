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
  });
};
