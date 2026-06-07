"use client";

import { BrainCircuit, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { PropertySearchMode } from "../semantic-search/types";

interface PropertySearchModeSwitchProps {
  mode: PropertySearchMode;
  onChange: (mode: PropertySearchMode) => void;
}

const PropertySearchModeSwitch = ({
  mode,
  onChange,
}: PropertySearchModeSwitchProps) => {
  const t = useTranslations("PropertiesPage.semanticSearch.mode");

  return (
    <section className="border-b border-stone-200 bg-white/90 py-3 backdrop-blur">
      <div className="container mx-auto px-4 md:px-20">
        <div className="inline-flex rounded-full border border-stone-200 bg-stone-100 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onChange("standard")}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors",
              mode === "standard"
                ? "bg-white text-stone-950 shadow-sm"
                : "text-stone-600 hover:text-stone-900",
            )}
          >
            <Search className="h-4 w-4" />
            {t("standard")}
          </button>
          <button
            type="button"
            onClick={() => onChange("semantic")}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors",
              mode === "semantic"
                ? "bg-stone-900 text-white shadow-sm"
                : "text-stone-600 hover:text-stone-900",
            )}
          >
            <BrainCircuit className="h-4 w-4" />
            {t("semantic")}
          </button>
        </div>
      </div>
    </section>
  );
};

export default PropertySearchModeSwitch;
