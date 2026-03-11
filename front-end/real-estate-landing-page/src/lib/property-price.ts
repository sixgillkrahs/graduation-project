export type PropertyPriceUnit =
  | "VND"
  | "MILLION"
  | "BILLION"
  | "MILLION_PER_M2";
export type PropertyCurrency = "VND" | "USD";

const getLocaleTag = (locale?: string) =>
  locale?.toLowerCase().startsWith("vi") ? "vi-VN" : "en-US";

export const getPropertyPriceUnitLabel = (
  unit?: string,
  locale?: string,
): string => {
  const isVietnamese = locale?.toLowerCase().startsWith("vi");

  switch (unit) {
    case "VND":
      return isVietnamese ? "VNĐ" : "VND";
    case "MILLION":
      return isVietnamese ? "triệu" : "million";
    case "BILLION":
      return isVietnamese ? "tỷ" : "billion";
    case "MILLION_PER_M2":
      return isVietnamese ? "triệu/m²" : "million/m²";
    default:
      return unit || "";
  }
};

export const normalizePropertyPrice = (
  price?: number | string,
  unit?: string,
  area?: number,
) => {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return null;
  }

  switch (unit) {
    case "VND":
      return numericPrice;
    case "MILLION":
      return numericPrice * 1_000_000;
    case "BILLION":
      return numericPrice * 1_000_000_000;
    case "MILLION_PER_M2":
      return area && area > 0 ? numericPrice * 1_000_000 * area : null;
    default:
      return numericPrice * 1_000_000;
  }
};

export const formatPropertyPrice = (
  price?: number | string,
  unit?: string,
  currency: PropertyCurrency = "VND",
  locale?: string,
) => {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "Not specified";
  }

  const localeTag = getLocaleTag(locale);

  if (unit === "VND") {
    return new Intl.NumberFormat(localeTag, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(numericPrice);
  }

  return `${new Intl.NumberFormat(localeTag, {
    maximumFractionDigits: 2,
  }).format(
    numericPrice,
  )} ${getPropertyPriceUnitLabel(unit, locale)} ${currency}`.trim();
};

export const formatPropertyPricePerSqm = (
  price?: number | string,
  unit?: string,
  area?: number,
  currency: PropertyCurrency = "VND",
  locale?: string,
) => {
  const numericArea = Number(area);
  if (!Number.isFinite(numericArea) || numericArea <= 0) {
    return null;
  }

  if (unit === "MILLION_PER_M2") {
    return formatPropertyPrice(price, unit, currency, locale);
  }

  const normalizedPrice = normalizePropertyPrice(price, unit, numericArea);
  if (!normalizedPrice) {
    return null;
  }

  if (currency === "USD") {
    return null;
  }

  return `${new Intl.NumberFormat(getLocaleTag(locale), {
    maximumFractionDigits: 0,
  }).format(normalizedPrice / numericArea)} VND/m²`;
};
