import { formatPropertyPrice } from "@/shared/utils/propertyPrice";
import { Tag } from "antd";

type DemandType = "SALE" | "RENT" | string;
type PropertyCurrency = "VND" | "USD";

interface DemandTypePresentationOptions {
  demandType: DemandType;
  saleLabel: string;
  rentLabel: string;
}

interface PropertyPricePresentationOptions extends DemandTypePresentationOptions {
  price?: number;
  priceUnit?: string;
  currency?: PropertyCurrency;
  salePriceLabel: string;
  rentPriceLabel: string;
}

const getDemandTypePresentation = ({
  demandType,
  saleLabel,
  rentLabel,
}: DemandTypePresentationOptions) => {
  const isSale = demandType === "SALE";

  return {
    label: isSale ? saleLabel : rentLabel,
    color: isSale ? "green" : "orange",
    textClassName: isSale ? "text-green-700" : "text-orange-600",
    secondaryLabel: isSale ? saleLabel : rentLabel,
  };
};

export const renderDemandTypeTag = (
  demandType: DemandType,
  saleLabel: string,
  rentLabel: string,
) => {
  const presentation = getDemandTypePresentation({
    demandType,
    saleLabel,
    rentLabel,
  });

  return (
    <Tag color={presentation.color} className="rounded-full px-3 py-1 font-semibold">
      {presentation.label}
    </Tag>
  );
};

export const renderPropertyPriceCell = ({
  demandType,
  saleLabel,
  rentLabel,
  price,
  priceUnit,
  currency = "VND",
  salePriceLabel,
  rentPriceLabel,
}: PropertyPricePresentationOptions) => {
  const presentation = getDemandTypePresentation({
    demandType,
    saleLabel,
    rentLabel,
  });

  return (
    <div className="flex min-w-[170px] flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        {renderDemandTypeTag(demandType, saleLabel, rentLabel)}
        <span className="text-xs font-medium text-gray-500">
          {demandType === "SALE" ? salePriceLabel : rentPriceLabel}
        </span>
      </div>
      <span className={`text-sm font-bold ${presentation.textClassName}`}>
        {formatPropertyPrice(price, priceUnit, currency)}
      </span>
    </div>
  );
};

export const renderPropertyPriceSummary = ({
  demandType,
  saleLabel,
  rentLabel,
  price,
  priceUnit,
  currency = "VND",
  salePriceLabel,
  rentPriceLabel,
}: PropertyPricePresentationOptions) => {
  const presentation = getDemandTypePresentation({
    demandType,
    saleLabel,
    rentLabel,
  });

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {renderDemandTypeTag(demandType, saleLabel, rentLabel)}
        <span className="text-sm font-medium text-gray-600">
          {demandType === "SALE" ? salePriceLabel : rentPriceLabel}
        </span>
      </div>
      <span className={`text-2xl font-bold ${presentation.textClassName}`}>
        {formatPropertyPrice(price, priceUnit, currency)}
      </span>
    </div>
  );
};
