import { IResp } from "@/@types/service";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { CreateScheduleRequest } from "../dto/schedule.dto";
import ScheduleService from "./service";
import { queryClient } from "@/lib/react-query/queryClient";
import { ScheduleQueryKey } from "./config";

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
    },
  });
};
