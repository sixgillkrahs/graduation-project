"use client";

import { BookmarkPlus, History, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { CsButton } from "@/components/custom";
import { Badge } from "@/components/ui/badge";
import type { PropertySavedSearch } from "../saved-search/saved-search.types";
import { countSavedSearchCriteria } from "../saved-search/saved-search.utils";

interface SavedSearchesPanelProps {
  items: PropertySavedSearch[];
  activeQueryString: string;
  canSaveCurrentSearch: boolean;
  onOpenSaveDialog: () => void;
  onApply: (queryString: string) => void;
  onDelete: (id: string) => void;
}

const SavedSearchesPanel = ({
  items,
  activeQueryString,
  canSaveCurrentSearch,
  onOpenSaveDialog,
  onApply,
  onDelete,
}: SavedSearchesPanelProps) => {
  const t = useTranslations("PropertiesPage.savedSearches");

  return (
    <section className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-stone-900">
            <History className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-600">
              {t("title")}
            </h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            {t("description")}
          </p>
        </div>

        <CsButton
          type="button"
          onClick={onOpenSaveDialog}
          disabled={!canSaveCurrentSearch}
          icon={<BookmarkPlus className="h-4 w-4" />}
          className="h-11 rounded-full px-5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t("saveCurrent")}
        </CsButton>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {items.map((item) => {
            const isActive = item.queryString === activeQueryString;

            return (
              <div
                key={item.id}
                className={`group flex items-center rounded-full border transition-colors ${
                  isActive
                    ? "border-red-200 bg-red-50"
                    : "border-stone-200 bg-stone-50 hover:border-stone-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onApply(item.queryString)}
                  className="flex items-center gap-2 px-4 py-2 text-left"
                >
                  <span className="text-sm font-medium text-stone-900">
                    {item.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={`border-none ${
                      isActive
                        ? "bg-red-100 text-red-700"
                        : "bg-white text-stone-600"
                    }`}
                  >
                    {t("criteria", {
                      count: countSavedSearchCriteria(item.queryString),
                    })}
                  </Badge>
                  {isActive ? (
                    <span className="text-xs font-semibold text-red-600">
                      {t("active")}
                    </span>
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-white hover:text-stone-700"
                  aria-label={t("remove")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-sm text-stone-500">{t("empty")}</p>
      )}
    </section>
  );
};

export default SavedSearchesPanel;
