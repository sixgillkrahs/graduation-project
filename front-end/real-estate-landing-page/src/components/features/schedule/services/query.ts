import { useQuery } from "@tanstack/react-query";
import { ScheduleQueryKey } from "./config";
import ScheduleService from "./service";
import { IParamsPagination } from "@/@types/service";

export interface IParamsSchedule extends Partial<IParamsPagination> {
  start: string;
  end: string;
}

export interface IAvailabilityParams {
  listingId: string;
  date: string;
}

export const useGetScheduleAvailability = (params?: IAvailabilityParams) => {
  return useQuery({
    queryKey: [ScheduleQueryKey.getAvailability, params],
    queryFn: () => ScheduleService.getAvailability(params as IAvailabilityParams),
    enabled: Boolean(params?.listingId && params?.date),
  });
};

export const useGetSchedulesMe = (params?: IParamsSchedule) => {
  return useQuery({
    queryKey: [ScheduleQueryKey.getSchedules, params],
    queryFn: () => ScheduleService.getSchedulesMe(params),
    enabled: !!params?.start && !!params?.end,
  });
};

export const useGetLeads = () => {
  return useQuery({
    queryKey: [ScheduleQueryKey.getLeads],
    queryFn: () => ScheduleService.getLeads(),
  });
};

export const useGetScheduleById = (id: string) => {
  return useQuery({
    queryKey: [ScheduleQueryKey.getScheduleById, id],
    queryFn: () => ScheduleService.getScheduleById(id),
    enabled: !!id,
  });
};
