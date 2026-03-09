"use client";

import { formatDistanceToNow } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { BadgeDollarSign, Mail, User } from "lucide-react";
import { formatPropertyPrice } from "@/lib/property-price";
import { useLocale, useTranslations } from "next-intl";
import { ISalesLogItemDto } from "../dto/revenue.dto";

interface RecentSalesProps {
  sales?: ISalesLogItemDto[];
}

const RecentInquiries = ({ sales = [] }: RecentSalesProps) => {
  const t = useTranslations("AgentDashboard.sales");
  const locale = useLocale();
  const dateLocale = locale.toLowerCase().startsWith("vi") ? vi : enUS;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border cs-outline-gray h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-base! cs-typography">
          {t("title")}
        </h3>
        <span className="text-sm main-color-red font-medium">
          {t("deals", { count: sales.length })}
        </span>
      </div>
      <div className="space-y-4">
        {sales.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
            {t("empty")}
          </div>
        ) : (
          sales.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 text-red-600">
                  <BadgeDollarSign size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-black truncate">
                    {item.propertySnapshot.title}
                  </p>
                  <p className="text-xs cs-paragraph-gray truncate">
                    {item.propertySnapshot.address}, {item.propertySnapshot.ward}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <User size={11} />
                      {item.soldTo || t("customerFallback")}
                    </span>
                    {item.soldToEmail && (
                      <span className="inline-flex items-center gap-1 truncate">
                        <Mail size={11} />
                        {item.soldToEmail}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 pl-3">
                <p className="font-semibold text-sm text-black">
                  {formatPropertyPrice(
                    item.salePrice,
                    item.priceUnit,
                    item.currency,
                    locale,
                  )}
                </p>
                <p className="text-xs cs-paragraph-gray">
                  {formatDistanceToNow(new Date(item.soldAt), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentInquiries;
