import "../models.d.ts";
import { JobQueryKey } from "./config";
import JobService from "./service";
import type { IParamsPagination } from "@shared/types/service";
import { useQuery } from "@tanstack/react-query";

export const useGetJobs = (params: IParamsPagination & { status?: string; type?: string }) => {
  return useQuery({
    queryKey: [JobQueryKey.getJobs, params],
    queryFn: () => JobService.GetJobs(params),
  });
};
