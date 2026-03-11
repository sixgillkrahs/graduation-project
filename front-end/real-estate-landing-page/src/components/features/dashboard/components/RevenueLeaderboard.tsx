"use client";

import { formatPropertyPrice } from "@/lib/property-price";
import { Crown, Medal, Trophy } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ReactNode } from "react";
import { IRevenueLeaderboardItemDto } from "../dto/revenue.dto";

interface RevenueLeaderboardProps {
  items?: IRevenueLeaderboardItemDto[];
  currency: "VND" | "USD";
}

const rankIconMap: Record<number, ReactNode> = {
  1: <Crown size={16} className="text-amber-500" />,
  2: <Trophy size={16} className="text-slate-500" />,
  3: <Medal size={16} className="text-orange-500" />,
};

const RevenueLeaderboard = ({
  items = [],
  currency,
}: RevenueLeaderboardProps) => {
  const t = useTranslations("AgentDashboard.leaderboard");
  const locale = useLocale();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border cs-outline-gray">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-xl! cs-typography">{t("title")}</h3>
          <p className="text-sm cs-paragraph-gray mt-1">
            {t("description", { currency })}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
            {t("empty", { currency })}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.agentUserId}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 text-sm font-bold text-gray-500 flex items-center justify-center">
                  {rankIconMap[item.rank] || `#${item.rank}`}
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  {item.avatarUrl ? (
                    <Image
                      src={item.avatarUrl}
                      alt={item.fullName || t("agentFallback")}
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black text-white text-sm font-semibold">
                      {(item.fullName || "A").charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-black truncate">
                    {item.fullName || t("unknownAgent")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t("deals", { count: item.deals })}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-sm text-black">
                  {formatPropertyPrice(item.revenue, "VND", currency, locale)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RevenueLeaderboard;
