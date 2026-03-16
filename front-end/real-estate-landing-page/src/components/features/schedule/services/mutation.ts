import { type UseMutationResult, useMutation } from "@tanstack/react-query";
import type { IResp } from "@/@types/service";
import { queryClient } from "@/lib/react-query/queryClient";
import type {
  CreateScheduleRequest,
  RequestScheduleDto,
} from "../dto/schedule.dto";
import { ScheduleQueryKey } from "./config";
import ScheduleService from "./service";

export const useCreateSchedule = (): UseMutationResult<
  IResp<string>,
  Error,
  CreateScheduleRequest,
  void
> => {
  return useMutation({
    mutationFn: (data: CreateScheduleRequest) => {
      return ScheduleService.createSchedule(data);
    },
    meta: {
      ERROR_SOURCE: "notifications.createScheduleFailed",
      SUCCESS_MESSAGE: "notifications.createScheduleSuccess",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ScheduleQueryKey.getSchedules],
      });
      queryClient.invalidateQueries({
        queryKey: [ScheduleQueryKey.getLeads],
      });
      queryClient.invalidateQueries({
        queryKey: [ScheduleQueryKey.getAvailability],
      });
    },
  });
};

export const useRequestSchedule = (): UseMutationResult<
  IResp<string>,
  Error,
  RequestScheduleDto,
  void
> => {
  return useMutation({
    mutationFn: (data: RequestScheduleDto) => {
      return ScheduleService.requestSchedule(data);
    },
    meta: {
      ERROR_SOURCE: "notifications.requestScheduleFailed",
      SUCCESS_MESSAGE: "notifications.requestScheduleSuccess",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ScheduleQueryKey.getSchedules],
      });
      queryClient.invalidateQueries({
        queryKey: [ScheduleQueryKey.getLeads],
      });
      queryClient.invalidateQueries({
        queryKey: [ScheduleQueryKey.getAvailability],
      });
    },
  });
};

export const useDeleteSchedule = (): UseMutationResult<
  IResp<string>,
  Error,
  string, // id
  void
> => {
  return useMutation({
    mutationFn: (id: string) => {
      return ScheduleService.deleteSchedule(id);
    },
    meta: {
      ERROR_SOURCE: "notifications.deleteScheduleFailed",
      SUCCESS_MESSAGE: "notifications.deleteScheduleSuccess",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ScheduleQueryKey.getSchedules],
      });
      queryClient.invalidateQueries({
        queryKey: [ScheduleQueryKey.getAvailability],
      });
    },
  });
};

export const useUpdateSchedule = (): UseMutationResult<
  IResp<string>,
  Error,
  { id: string; data: CreateScheduleRequest },
  void
> => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateScheduleRequest }) => {
      return ScheduleService.updateSchedule(id, data);
    },
    meta: {
      ERROR_SOURCE: "notifications.updateScheduleFailed",
      SUCCESS_MESSAGE: "notifications.updateScheduleSuccess",
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ScheduleQueryKey.getSchedules],
      });
      queryClient.invalidateQueries({
        queryKey: [ScheduleQueryKey.getAvailability],
      });
    },
  });
};
