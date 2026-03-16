import { useMutation } from "@tanstack/react-query";
import { createReport } from "./service";

export const useCreateReport = () => {
  return useMutation({
    mutationFn: (payload: IReportService.CreateReportPayload) =>
      createReport(payload),
    meta: {
      ERROR_SOURCE: "Could not submit report",
      SUCCESS_MESSAGE: "Report submitted successfully",
    },
  });
};
