import { GeneralSettingsQueryKey } from "./config";
import GeneralSettingsService from "./service";
import { queryClient } from "@shared/queryClient";
import { useMutation } from "@tanstack/react-query";

export const useUpdateGeneralSettings = () => {
  return useMutation({
    mutationFn: (payload: ISettingService.UpdateGeneralSettingsDTO) =>
      GeneralSettingsService.UpdateGeneralSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GeneralSettingsQueryKey.GetGeneralSettings],
      });
    },
    meta: {
      ERROR_SOURCE: "[Update settings failed]",
      SUCCESS_MESSAGE: "General settings updated successfully",
    },
  });
};
