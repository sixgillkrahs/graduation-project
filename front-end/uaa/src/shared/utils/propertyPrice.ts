export const formatPropertyPrice = (
  price?: number,
  unit?: string,
  currency: "VND" | "USD" = "VND",
) => {
  if (!Number.isFinite(price) || !price || price <= 0) {
    return "N/A";
  }

  if (unit === "VND") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  }

  const unitLabelMap: Record<string, string> = {
    MILLION: "triệu",
    BILLION: "tỷ",
    MILLION_PER_M2: "triệu/m²",
  };

  const unitLabel = unitLabelMap[unit || ""] || unit || "";

  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(price)} ${unitLabel} ${currency}`.trim();
};
