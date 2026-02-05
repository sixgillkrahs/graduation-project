import { IResp } from "@/@types/service";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { CreateScheduleRequest } from "../dto/schedule.dto";
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
      ERROR_SOURCE: "[Create schedule failed]",
      SUCCESS_MESSAGE: "The schedule has been successfully created",
    },
  });
};
