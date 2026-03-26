"use client";

import { useLandingSettings } from "@/components/providers/LandingSettingsProvider";
import { formatLandingDateTime } from "@/lib/date-time-format";
import {
  formatMonthYearBySettings,
  type FormatDateTimeOptions,
} from "../../../shared/date-time/formatter";
import { useLocale } from "next-intl";
import { useCallback } from "react";

export const useDateTimeFormatter = () => {
  const settings = useLandingSettings();
  const locale = useLocale();
  const runtimeSettings = {
    ...settings,
    defaultLanguage: locale.toLowerCase().startsWith("vi") ? "vi" : "en",
  } as const;

  const formatDateTime = useCallback(
    (value?: string | number | Date | null, options?: FormatDateTimeOptions) =>
      formatLandingDateTime(value, runtimeSettings, options),
    [runtimeSettings],
  );

  const formatDate = useCallback(
    (
      value?: string | number | Date | null,
      options?: Omit<FormatDateTimeOptions, "includeTime">,
    ) =>
      formatLandingDateTime(value, runtimeSettings, {
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
