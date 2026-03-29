import {
  defaultDateTimeFormatterSettings,
  formatDateTimeBySettings,
  type DateTimeFormatterSettings,
  type FormatDateTimeOptions,
} from "gra-helper";
import type { LandingSettings } from "@/lib/landing-settings";

let currentLandingDateTimeSettings: DateTimeFormatterSettings =
  defaultDateTimeFormatterSettings;

export const getLandingDateTimeSettings = (
  settings?: Partial<LandingSettings> | null,
): DateTimeFormatterSettings => ({
  defaultLanguage:
    settings?.defaultLanguage || defaultDateTimeFormatterSettings.defaultLanguage,
  timezone: settings?.timezone || defaultDateTimeFormatterSettings.timezone,
  dateFormat: settings?.dateFormat || defaultDateTimeFormatterSettings.dateFormat,
});

export const syncLandingDateTimeSettings = (
  settings?: Partial<LandingSettings> | null,
) => {
  currentLandingDateTimeSettings = getLandingDateTimeSettings(settings);
};

export const formatLandingDateTime = (
  value: string | number | Date | null | undefined,
  settings?: Partial<LandingSettings> | null,
  options?: FormatDateTimeOptions,
) =>
  formatDateTimeBySettings(
    value,
    settings ? getLandingDateTimeSettings(settings) : currentLandingDateTimeSettings,
    options,
  );
