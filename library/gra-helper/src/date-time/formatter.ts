export type SupportedFormatterLanguage = "en" | "vi";

export type DateTimeFormatterSettings = {
  defaultLanguage: SupportedFormatterLanguage;
  timezone: string;
  dateFormat: string;
};

export type FormatDateTimeOptions = {
  includeTime?: boolean;
  includeSeconds?: boolean;
  fallback?: string;
};

export const defaultDateTimeFormatterSettings: DateTimeFormatterSettings = {
  defaultLanguage: "vi",
  timezone: "Asia/Ho_Chi_Minh",
  dateFormat: "DD/MM/YYYY",
};

export const resolveLocaleTag = (language: SupportedFormatterLanguage) =>
  language === "vi" ? "vi-VN" : "en-US";

const normalizeDateInput = (value?: string | number | Date | null) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const resolveFormatterSettings = (
  settings?: Partial<DateTimeFormatterSettings> | null,
) => ({
  ...defaultDateTimeFormatterSettings,
  ...settings,
});

const buildDatePart = (
  year: string,
  month: string,
  day: string,
  format: string,
) => {
  switch (format) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD/MM/YYYY":
    default:
      return `${day}/${month}/${year}`;
  }
};

const getDateParts = (
  value: string | number | Date,
  settings?: Partial<DateTimeFormatterSettings> | null,
) => {
  const date = normalizeDateInput(value);

  if (!date) {
    return null;
  }

  const resolvedSettings = resolveFormatterSettings(settings);
  const formatter = new Intl.DateTimeFormat(
    resolveLocaleTag(resolvedSettings.defaultLanguage),
    {
      timeZone:
        resolvedSettings.timezone || defaultDateTimeFormatterSettings.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    },
  );

  return {
    resolvedSettings,
    mapped: Object.fromEntries(
      formatter.formatToParts(date).map((part) => [part.type, part.value]),
    ),
  };
};

export const formatDateTimeBySettings = (
  value: string | number | Date | null | undefined,
  settings?: Partial<DateTimeFormatterSettings> | null,
  options?: FormatDateTimeOptions,
) => {
  const fallback = options?.fallback ?? "--";
  const formatted = value ? getDateParts(value, settings) : null;

  if (!formatted) {
    return fallback;
  }

  const includeTime = options?.includeTime ?? true;
  const includeSeconds = options?.includeSeconds ?? true;
  const { mapped, resolvedSettings } = formatted;

  const datePart = buildDatePart(
    mapped.year || "0000",
    mapped.month || "00",
    mapped.day || "00",
    resolvedSettings.dateFormat || defaultDateTimeFormatterSettings.dateFormat,
  );

  if (!includeTime) {
    return datePart;
  }

  const timePart = includeSeconds
    ? `${mapped.hour || "00"}:${mapped.minute || "00"}:${mapped.second || "00"}`
    : `${mapped.hour || "00"}:${mapped.minute || "00"}`;

  return `${datePart} ${timePart}`;
};

export const formatMonthYearBySettings = (
  value: string | number | Date | null | undefined,
  settings?: Partial<DateTimeFormatterSettings> | null,
  fallback = "--",
) => {
  const date = normalizeDateInput(value);

  if (!date) {
    return fallback;
  }

  const resolvedSettings = resolveFormatterSettings(settings);

  return new Intl.DateTimeFormat(
    resolveLocaleTag(resolvedSettings.defaultLanguage),
    {
      timeZone:
        resolvedSettings.timezone || defaultDateTimeFormatterSettings.timezone,
      month: "long",
      year: "numeric",
    },
  ).format(date);
};
