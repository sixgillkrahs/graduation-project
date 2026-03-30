import i18n from "@/i18n";

export const formatPropertyPrice = (
  price?: number,
  unit?: string,
  currency: "VND" | "USD" = "VND",
) => {
  const locale = i18n.language?.startsWith("en") ? "en-US" : "vi-VN";

  if (!Number.isFinite(price) || !price || price <= 0) {
    return i18n.t("common.notAvailable", { defaultValue: "N/A" });
  }

  if (unit === "VND") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  }

  const unitLabelMap: Record<string, string> = {
    MILLION: i18n.t("properties.units.million", { defaultValue: "million" }),
    BILLION: i18n.t("properties.units.billion", { defaultValue: "billion" }),
    MILLION_PER_M2: i18n.t("properties.units.millionPerSquareMeter", {
      defaultValue: "million/m²",
    }),
  };

  const unitLabel = unitLabelMap[unit || ""] || unit || "";

  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(price)} ${unitLabel} ${currency}`.trim();
};
