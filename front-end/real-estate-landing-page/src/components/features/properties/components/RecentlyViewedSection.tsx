"use client";

import { findOptionLabel, LIST_PROVINCE, LIST_WARD } from "gra-helper";
import { ChevronDown, History } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { CsButton } from "@/components/custom";
import { formatPropertyPostedDate } from "@/lib/property-date";
import { cn } from "@/lib/utils";
import type { RecentlyViewedProperty } from "../recently-viewed/recently-viewed.types";
import PropertyCard from "./PropertyCard";

interface RecentlyViewedSectionProps {
  items: RecentlyViewedProperty[];
  maxItems?: number;
  onClear?: () => void;
  className?: string;
}

const RecentlyViewedSection = ({
  items,
  maxItems = 3,
  onClear,
  className,
}: RecentlyViewedSectionProps) => {
  const t = useTranslations("PropertiesPage.recentlyViewed");
  const locale = useLocale();
  const [isExpanded, setIsExpanded] = useState(true);

  if (items.length === 0) {
    return null;
  }

  const visibleItems = items.slice(0, maxItems);

  return (
    <section
      className={`overflow-hidden rounded-[28px] border border-stone-200 bg-[linear-gradient(145deg,#ffffff_0%,#f7f2ea_52%,#f3ede4_100%)] p-5 shadow-sm ${className || ""}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-stone-900">
            <History className="h-4 w-4 text-red-500" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              {t("eyebrow")}
            </p>
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
            {t("title")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            {t("description")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onClear ? (
            <CsButton
              type="button"
              variant="outline"
              onClick={onClear}
              className="rounded-full"
            >
              {t("clear")}
            </CsButton>
          ) : null}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-4 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-white"
          >
            {isExpanded ? t("collapse") : t("expand")}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>

      {isExpanded ? (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => (
            <PropertyCard
              key={item.id}
              id={item.id}
              image={item.image}
              title={item.title}
              badges={item.badges}
              address={`${item.address}, ${findOptionLabel(item.ward, LIST_WARD)}, ${findOptionLabel(item.province, LIST_PROVINCE)}`}
              price={String(item.price)}
              currency={item.currency}
              specs={item.specs}
              unit={item.unit}
              agent={item.agent}
              postedAt={formatPropertyPostedDate(item.postedAt, locale)}
              type={item.type}
              isFavorite={item.isFavorite}
              compareItem={item.compareItem}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default RecentlyViewedSection;
