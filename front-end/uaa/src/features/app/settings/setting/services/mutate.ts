import { GeneralSettingsQueryKey } from "./config";
import GeneralSettingsService from "./service";
import { queryClient } from "@shared/queryClient";
import { useMutation } from "@tanstack/react-query";

export const useUpdateGeneralSettings = () => {
  return useMutation({
    mutationFn: (payload: ISettingService.UpdateGeneralSettingsDTO) =>
      GeneralSettingsService.UpdateGeneralSettings(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(
        [GeneralSettingsQueryKey.GetGeneralSettings],
        response,
      );
    },
    meta: {
      ERROR_SOURCE: "[Update settings failed]",
      SUCCESS_MESSAGE: "General settings updated successfully",
    },
  });
};
