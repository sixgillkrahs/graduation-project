import { useGetGeneralSettings } from "@/features/app/settings/setting/services/query";
import {
  defaultDateTimeFormatterSettings,
  type DateTimeFormatterSettings,
} from "../../../../shared/date-time/formatter";
import { createContext, useContext, useMemo, type ReactNode } from "react";

const GeneralSettingsContext = createContext<DateTimeFormatterSettings>(
  defaultDateTimeFormatterSettings,
);

export const GeneralSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useGetGeneralSettings();

  const value = useMemo<DateTimeFormatterSettings>(
    () => ({
      defaultLanguage:
        data?.data?.defaultLanguage || defaultDateTimeFormatterSettings.defaultLanguage,
      timezone: data?.data?.timezone || defaultDateTimeFormatterSettings.timezone,
      dateFormat: data?.data?.dateFormat || defaultDateTimeFormatterSettings.dateFormat,
    }),
    [data?.data?.dateFormat, data?.data?.defaultLanguage, data?.data?.timezone],
  );

  return (
    <GeneralSettingsContext.Provider value={value}>
      {children}
    </GeneralSettingsContext.Provider>
  );
};

export const useGeneralSettings = () => useContext(GeneralSettingsContext);
