import { useGeneralSettings } from "@shared/providers/GeneralSettingsProvider";
import {
  formatDateTimeBySettings,
  formatMonthYearBySettings,
  type FormatDateTimeOptions,
} from "gra-helper";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

export const useDateTimeFormatter = () => {
  const settings = useGeneralSettings();
  const { i18n } = useTranslation();
  const runtimeSettings = {
    ...settings,
    defaultLanguage: i18n.language.toLowerCase().startsWith("vi") ? "vi" : "en",
  } as const;

  const formatDateTime = useCallback(
    (value?: string | number | Date | null, options?: FormatDateTimeOptions) =>
      formatDateTimeBySettings(value, runtimeSettings, options),
    [runtimeSettings],
  );

  const formatDate = useCallback(
    (
      value?: string | number | Date | null,
      options?: Omit<FormatDateTimeOptions, "includeTime">,
    ) =>
      formatDateTimeBySettings(value, runtimeSettings, {
        includeTime: false,
        ...options,
      }),
    [runtimeSettings],
  );

  const formatMonthYear = useCallback(
    (value?: string | number | Date | null, fallback?: string) =>
      formatMonthYearBySettings(value, runtimeSettings, fallback),
    [runtimeSettings],
  );

  return {
    settings: runtimeSettings,
    formatDateTime,
    formatDate,
    formatMonthYear,
  };
};
