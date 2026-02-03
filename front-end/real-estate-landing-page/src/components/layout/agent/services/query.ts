import { IParamsPagination } from "@/@types/service";
import { useInfiniteQuery } from "@tanstack/react-query";
import { NoticeKey } from "./config";
import NoticeService from "./service";

export const useGetMyNotices = (params: IParamsPagination) => {
  return useInfiniteQuery({
    queryKey: [NoticeKey.getMyNotices, params],
    initialPageParam: params.page || 1,
    queryFn: ({ pageParam }) => {
      return NoticeService.getMyNotices({
        ...params,
        page: pageParam as number,
      });
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data;
      const next = page + 1;
      return next <= totalPages ? next : undefined;
    },
    refetchInterval: 30000,
  });
};
