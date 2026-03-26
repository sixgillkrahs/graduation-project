import { formatLandingDateTime } from "@/lib/date-time-format";

export const formatPropertyPostedDate = (
  value: string | Date,
  locale = "en",
) => {
  return formatLandingDateTime(
    value,
    {
      defaultLanguage: locale.toLowerCase().startsWith("vi") ? "vi" : "en",
    },
    {
      includeTime: false,
      fallback: "",
    },
  );
};
