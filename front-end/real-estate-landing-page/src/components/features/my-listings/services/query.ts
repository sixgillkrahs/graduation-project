import { IParamsPagination } from "@/@types/service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PropertyKey } from "./config";
import PropertyService from "./service";

export const useGetMyProperties = (params?: IParamsPagination) => {
  return useQuery({
    queryKey: [PropertyKey.getProperties, params],
    queryFn: () => PropertyService.getProperties(params),
  });
};

export const useGetPropertyDetail = (id: string) => {
  return useQuery({
    queryKey: [PropertyKey.getPropertyDetail, id],
    queryFn: () => PropertyService.getPropertyDetail(id),
    enabled: !!id,
  });
};

export const useUpdatePropertyStatus = () => {
  return useMutation({
    mutationFn: (data: {
      id: string;
      status: string;
      soldPrice?: number;
      soldTo?: string;
      soldAt?: string;
    }) =>
      PropertyService.updatePropertyStatus(
        data.id,
        data.status,
        data.soldPrice,
        data.soldTo,
        data.soldAt,
      ),
  });
};
