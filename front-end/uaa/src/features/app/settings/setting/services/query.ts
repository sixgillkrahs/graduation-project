import { GeneralSettingsQueryKey } from "./config";
import GeneralSettingsService from "./service";
import { useQuery } from "@tanstack/react-query";

export const useGetGeneralSettings = () => {
  return useQuery({
    queryKey: [GeneralSettingsQueryKey.GetGeneralSettings],
    queryFn: GeneralSettingsService.GetGeneralSettings,
    meta: {
      ERROR_SOURCE: "[Load settings failed]",
    },
  });
};

export const useGetPublicGeneralSettings = () => {
  return useQuery({
    queryKey: [GeneralSettingsQueryKey.GetPublicGeneralSettings],
    queryFn: GeneralSettingsService.GetPublicGeneralSettings,
    meta: {
      ERROR_SOURCE: "[Load public settings failed]",
    },
  });
};
