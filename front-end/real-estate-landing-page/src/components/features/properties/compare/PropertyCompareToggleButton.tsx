"use client";

import { Check, Scale } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  PROPERTY_COMPARE_MAX_ITEMS,
  type PropertyCompareItem,
} from "./compare.types";
import {
  usePropertyCompare,
  usePropertyCompareActions,
} from "./usePropertyCompare";

interface PropertyCompareToggleButtonProps {
  item: PropertyCompareItem;
  variant?: "card" | "outline" | "text";
  className?: string;
}

const PropertyCompareToggleButton = ({
  item,
  variant = "outline",
  className,
}: PropertyCompareToggleButtonProps) => {
  const t = useTranslations("PropertiesPage.compare");
  const { items } = usePropertyCompare();
  const { addItem, removeItem } = usePropertyCompareActions();

  const isCompared = items.some((compareItem) => compareItem.id === item.id);

  const handleToggleCompare = () => {
    if (isCompared) {
      removeItem(item.id);
      toast.success(t("removed"));
      return;
    }

    if (items.length >= PROPERTY_COMPARE_MAX_ITEMS) {
      toast.error(t("maxReached"));
      return;
    }

    addItem(item);
    toast.success(t("added", { count: items.length + 1 }));
  };

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          handleToggleCompare();
        }}
        className={cn(
          "absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-sm transition-colors",
          isCompared
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-white/40 bg-white/85 text-stone-700 backdrop-blur-md hover:bg-white",
          className,
        )}
      >
        {isCompared ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Scale className="h-3.5 w-3.5" />
        )}
        <span>{isCompared ? t("selected") : t("add")}</span>
      </button>
    );
  }

  if (variant === "text") {
    return (
      <button
        type="button"
        onClick={handleToggleCompare}
        className={cn(
          "inline-flex items-center gap-2 text-sm font-medium transition-colors",
          isCompared
            ? "text-emerald-600 hover:text-emerald-700"
            : "text-muted-foreground hover:text-foreground",
          className,
        )}
      >
        {isCompared ? (
          <Check className="h-4 w-4" />
        ) : (
          <Scale className="h-4 w-4" />
        )}
        {isCompared ? t("selected") : t("add")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggleCompare}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
        isCompared
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50",
        className,
      )}
    >
      {isCompared ? (
        <Check className="h-4 w-4" />
      ) : (
        <Scale className="h-4 w-4" />
      )}
      {isCompared ? t("selected") : t("add")}
    </button>
  );
};

export default PropertyCompareToggleButton;
