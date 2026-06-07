"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPropertyPrice } from "@/lib/property-price";
import { useLocale, useTranslations } from "next-intl";
import type { SemanticPropertySearchResponseData } from "../types";
import { hasAppliedFilters } from "../utils";

interface SemanticSearchSummaryProps {
  data: SemanticPropertySearchResponseData;
  className?: string;
}

const SemanticSearchSummary = ({
  data,
  className,
}: SemanticSearchSummaryProps) => {
  const t = useTranslations("PropertiesPage.semanticSearch.summary");
  const locale = useLocale();
  const filterLabelMap: Record<string, string> = {
    demandType: t("labels.demandType"),
    propertyType: t("labels.propertyType"),
    province: t("labels.province"),
    district: t("labels.district"),
    ward: t("labels.ward"),
    minPrice: t("labels.minPrice"),
    maxPrice: t("labels.maxPrice"),
    minArea: t("labels.minArea"),
    maxArea: t("labels.maxArea"),
    minBedrooms: t("labels.minBedrooms"),
    minBathrooms: t("labels.minBathrooms"),
    amenities: t("labels.amenities"),
  };

  const formatFilterValue = (key: string, value: unknown) => {
    if (typeof value === "number" && key.toLowerCase().includes("price")) {
      return formatPropertyPrice(value, "VND", "VND", locale);
    }

    if (typeof value === "number" && key.toLowerCase().includes("area")) {
      return `${value} m²`;
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (value === "SALE") {
      return t("values.sale");
    }

    if (value === "RENT") {
      return t("values.rent");
    }

    return String(value);
  };

  const appliedFilterEntries = Object.entries(data.appliedFilters || {}).filter(
    ([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return value !== undefined && value !== null && value !== "";
    },
  );

  return (
    <div className={cn("space-y-4", className)}>
      {data.answer ? (
        <section className="rounded-[28px] border border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_48%,#eff6ff_100%)] p-5 shadow-sm">
          <div className="inline-flex rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            {t("answerEyebrow")}
          </div>
          <p className="mt-3 text-sm leading-7 text-stone-700">{data.answer}</p>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              {t("queryEyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
              “{data.query}”
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {t("resultMeta", {
                total: data.totalResults,
                page: data.page,
                totalPages: data.totalPages,
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                {t("retrieved")}
              </p>
              <p className="mt-2 text-xl font-semibold text-stone-900">
                {data.retrieval.retrievedCandidates}
              </p>
            </div>
            <div className="rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                {t("matched")}
              </p>
              <p className="mt-2 text-xl font-semibold text-stone-900">
                {data.retrieval.matchedCandidates}
              </p>
            </div>
            <div className="rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                {t("rerankModel")}
              </p>
              <p className="mt-2 text-sm font-semibold text-stone-900">
                {data.retrieval.rerankModel}
              </p>
            </div>
          </div>
        </div>

        {hasAppliedFilters(data.appliedFilters) ? (
          <div className="mt-5 border-t border-stone-100 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              {t("appliedFilters")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {appliedFilterEntries.map(([key, value]) => (
                <Badge
                  key={key}
                  variant="outline"
                  className="rounded-full border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700"
                >
                  {filterLabelMap[key] || key}: {formatFilterValue(key, value)}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default SemanticSearchSummary;
