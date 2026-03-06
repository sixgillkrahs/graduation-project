import { JobQueryKey } from "./config";
import JobService from "./service";
import { queryClient } from "@shared/queryClient";
import { useMutation } from "@tanstack/react-query";

export const useRetryJob = () => {
  return useMutation({
    mutationFn: JobService.RetryJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [JobQueryKey.getJobs] });
    },
    meta: {
      ERROR_SOURCE: "[Retry job failed]",
      SUCCESS_MESSAGE: "Job retried successfully",
    },
  });
};

export const useDeleteJob = () => {
  return useMutation({
    mutationFn: JobService.DeleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [JobQueryKey.getJobs] });
    },
    meta: {
      ERROR_SOURCE: "[Delete job failed]",
      SUCCESS_MESSAGE: "Job deleted successfully",
    },
  });
};
