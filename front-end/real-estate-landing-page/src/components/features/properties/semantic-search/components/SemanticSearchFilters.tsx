"use client";

import { LIST_PROVINCE } from "gra-helper";
import { ChevronDown, FilterX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { CsButton } from "@/components/custom";
import { Input } from "@/components/ui/input";
import { CsSelect } from "@/components/ui/select";
import { PROPERTY_AMENITIES } from "@/lib/property-amenities";
import { cn } from "@/lib/utils";
import type { SemanticPropertySearchFilters } from "../types";
import { normalizeSemanticFilters } from "../url-state";

interface SemanticSearchFiltersProps {
  initialFilters: SemanticPropertySearchFilters;
  onApply: (filters: SemanticPropertySearchFilters) => void;
  onReset: () => void;
  className?: string;
  sticky?: boolean;
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface SemanticSearchFilterDraft {
  demandType: string;
  propertyType: string;
  province: string;
  district: string;
  ward: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  minBedrooms: string;
  minBathrooms: string;
  amenities: string[];
}

const EMPTY_DRAFT: SemanticSearchFilterDraft = {
  demandType: "",
  propertyType: "",
  province: "",
  district: "",
  ward: "",
  minPrice: "",
  maxPrice: "",
  minArea: "",
  maxArea: "",
  minBedrooms: "",
  minBathrooms: "",
  amenities: [],
};

const formatPriceForInput = (value?: number) => {
  if (typeof value !== "number" || value <= 0) {
    return "";
  }

  return `${value / 1_000_000_000}`.replace(/\.0+$/, "");
};

const parseNumericValue = (value: string) => {
  if (!value.trim()) {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : undefined;
};

const buildDraftFromFilters = (
  filters: SemanticPropertySearchFilters,
): SemanticSearchFilterDraft => ({
  demandType: filters.demandType || "",
  propertyType: filters.propertyType || "",
  province: filters.province || "",
  district: filters.district || "",
  ward: filters.ward || "",
  minPrice: formatPriceForInput(filters.minPrice),
  maxPrice: formatPriceForInput(filters.maxPrice),
  minArea: typeof filters.minArea === "number" ? String(filters.minArea) : "",
  maxArea: typeof filters.maxArea === "number" ? String(filters.maxArea) : "",
  minBedrooms:
    typeof filters.minBedrooms === "number" ? String(filters.minBedrooms) : "",
  minBathrooms:
    typeof filters.minBathrooms === "number"
      ? String(filters.minBathrooms)
      : "",
  amenities: filters.amenities || [],
});

const SemanticSearchFilters = ({
  initialFilters,
  onApply,
  onReset,
  className,
  sticky = true,
  collapsible = false,
  collapsed = false,
  onCollapsedChange,
}: SemanticSearchFiltersProps) => {
  const t = useTranslations("PropertiesPage.semanticSearch.filters");
  const [draft, setDraft] = useState<SemanticSearchFilterDraft>(
    buildDraftFromFilters(initialFilters),
  );

  useEffect(() => {
    setDraft(buildDraftFromFilters(initialFilters));
  }, [initialFilters]);

  const provinceOptions = useMemo(
    () =>
      LIST_PROVINCE.map((province) => ({
        label: province.label,
        value: province.label,
      })),
    [],
  );

  const demandOptions = [
    { label: t("allDemand"), value: "" },
    { label: t("sale"), value: "SALE" },
    { label: t("rent"), value: "RENT" },
  ];

  const propertyTypeOptions = [
    { label: t("allTypes"), value: "" },
    { label: t("apartment"), value: "APARTMENT" },
    { label: t("house"), value: "HOUSE" },
    { label: t("streetHouse"), value: "STREET_HOUSE" },
    { label: t("villa"), value: "VILLA" },
    { label: t("land"), value: "LAND" },
    { label: t("other"), value: "OTHER" },
  ];

  const minimumUnitOptions = Array.from({ length: 6 }, (_, index) => {
    const value = String(index + 1);
    return {
      label: index === 5 ? `${value}+` : value,
      value,
    };
  });

  const amenityOptions = PROPERTY_AMENITIES.map((option) => ({
    label: option.label,
    value: option.value,
  }));

  const updateDraft = (
    key: keyof SemanticSearchFilterDraft,
    value: string | string[],
  ) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    onApply(
      normalizeSemanticFilters({
        demandType:
          draft.demandType === "SALE" || draft.demandType === "RENT"
            ? draft.demandType
            : undefined,
        propertyType: draft.propertyType
          ? (draft.propertyType as SemanticPropertySearchFilters["propertyType"])
          : undefined,
        province: draft.province,
        district: draft.district,
        ward: draft.ward,
        minPrice: parseNumericValue(draft.minPrice)
          ? parseNumericValue(draft.minPrice)! * 1_000_000_000
          : undefined,
        maxPrice: parseNumericValue(draft.maxPrice)
          ? parseNumericValue(draft.maxPrice)! * 1_000_000_000
          : undefined,
        minArea: parseNumericValue(draft.minArea),
        maxArea: parseNumericValue(draft.maxArea),
        minBedrooms: parseNumericValue(draft.minBedrooms),
        minBathrooms: parseNumericValue(draft.minBathrooms),
        amenities: draft.amenities,
      }),
    );
  };

  const handleReset = () => {
    setDraft(EMPTY_DRAFT);
    onReset();
  };

  return (
    <aside
      className={cn(
        "w-full min-w-[280px] rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm",
        sticky && "lg:sticky lg:top-32 h-fit",
        !sticky && "min-w-0 shadow-none",
        className,
      )}
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
            <FilterX className="h-5 w-5 text-red-500" />
            {t("title")}
          </h2>
          {collapsible ? (
            <button
              type="button"
              onClick={() => onCollapsedChange?.(!collapsed)}
              className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"
            >
              {collapsed ? t("expand") : t("collapse")}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${collapsed ? "" : "rotate-180"}`}
              />
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-sm font-medium text-red-500 transition-colors hover:text-red-600 hover:underline"
        >
          {t("reset")}
        </button>
      </div>

      <div className={collapsed ? "hidden" : "space-y-5"}>
        <div className="grid gap-4">
          <CsSelect
            label={t("demandType")}
            placeholder={t("allDemand")}
            options={demandOptions}
            value={draft.demandType}
            onChange={(value) => updateDraft("demandType", value)}
          />
          <CsSelect
            label={t("propertyType")}
            placeholder={t("allTypes")}
            options={propertyTypeOptions}
            value={draft.propertyType}
            onChange={(value) => updateDraft("propertyType", value)}
          />
          <CsSelect
            label={t("province")}
            placeholder={t("provincePlaceholder")}
            options={provinceOptions}
            value={draft.province}
            onChange={(value) => updateDraft("province", value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t("district")}
              placeholder={t("districtPlaceholder")}
              value={draft.district}
              onChange={(event) => updateDraft("district", event.target.value)}
            />
            <Input
              label={t("ward")}
              placeholder={t("wardPlaceholder")}
              value={draft.ward}
              onChange={(event) => updateDraft("ward", event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              type="number"
              min={0}
              step="0.1"
              label={t("minPrice")}
              placeholder="1.0"
              description={t("priceHint")}
              value={draft.minPrice}
              onChange={(event) => updateDraft("minPrice", event.target.value)}
            />
            <Input
              type="number"
              min={0}
              step="0.1"
              label={t("maxPrice")}
              placeholder="3.0"
              description={t("priceHint")}
              value={draft.maxPrice}
              onChange={(event) => updateDraft("maxPrice", event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              type="number"
              min={0}
              label={t("minArea")}
              placeholder="50"
              description={t("areaHint")}
              value={draft.minArea}
              onChange={(event) => updateDraft("minArea", event.target.value)}
            />
            <Input
              type="number"
              min={0}
              label={t("maxArea")}
              placeholder="120"
              description={t("areaHint")}
              value={draft.maxArea}
              onChange={(event) => updateDraft("maxArea", event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CsSelect
              label={t("minBedrooms")}
              placeholder={t("selectMinBedrooms")}
              options={minimumUnitOptions}
              value={draft.minBedrooms}
              onChange={(value) => updateDraft("minBedrooms", value)}
            />
            <CsSelect
              label={t("minBathrooms")}
              placeholder={t("selectMinBathrooms")}
              options={minimumUnitOptions}
              value={draft.minBathrooms}
              onChange={(value) => updateDraft("minBathrooms", value)}
            />
          </div>

          <CsSelect
            label={t("amenities")}
            placeholder={t("amenitiesPlaceholder")}
            options={amenityOptions}
            multiple
            value={draft.amenities}
            onChange={(value) => updateDraft("amenities", value as string[])}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-stone-100 pt-4">
          <CsButton
            type="button"
            className="h-11 rounded-xl text-sm font-semibold"
            onClick={handleApply}
          >
            {t("apply")}
          </CsButton>
          <p className="text-xs leading-5 text-stone-500">{t("helper")}</p>
        </div>
      </div>
    </aside>
  );
};

export default SemanticSearchFilters;
