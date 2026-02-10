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
