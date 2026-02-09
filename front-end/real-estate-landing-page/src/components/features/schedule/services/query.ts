import { useQuery } from "@tanstack/react-query";
import { ScheduleQueryKey } from "./config";
import ScheduleService from "./service";
import { IParamsPagination } from "@/@types/service";
import { format } from "date-fns";

export interface IParamsSchedule extends Partial<IParamsPagination> {
  start: string;
  end: string;
}

export const useGetSchedulesMe = (params?: IParamsSchedule) => {
  return useQuery({
    queryKey: [ScheduleQueryKey.getSchedules, params],
    queryFn: () => ScheduleService.getSchedulesMe(params),
    enabled: !!params?.start && !!params?.end,
  });
};

export const useGetScheduleById = (id: string) => {
  return useQuery({
    queryKey: [ScheduleQueryKey.getScheduleById, id],
    queryFn: () => ScheduleService.getScheduleById(id),
    enabled: !!id,
  });
};
