"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/const/routes";
import { PROPERTY_COMPARE_MIN_ITEMS } from "./compare.types";
import {
  usePropertyCompare,
  usePropertyCompareActions,
} from "./usePropertyCompare";

const PropertyCompareFloatingBar = () => {
  const router = useRouter();
  const t = useTranslations("PropertiesPage.compare");
  const { items, hydrated } = usePropertyCompare();
  const { clearItems, removeItem } = usePropertyCompareActions();

  if (!hydrated || items.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 px-4">
      <div className="pointer-events-auto mx-auto flex max-w-6xl flex-col gap-4 rounded-[28px] border border-stone-200 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                {t("tray.eyebrow")}
              </p>
              <p className="mt-1 text-sm text-stone-700">
                {t("tray.count", { count: items.length })}
              </p>
            </div>
            <button
              type="button"
              onClick={clearItems}
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
            >
              <Trash2 className="h-4 w-4" />
              {t("clear")}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 pr-3"
              >
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <span className="max-w-40 truncate text-sm font-medium text-stone-700">
                  {item.title}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-stone-400 transition-colors hover:text-stone-700"
                  aria-label={t("remove")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(ROUTES.PROPERTIES)}
          >
            {t("continueBrowsing")}
          </Button>
          <Button
            type="button"
            onClick={() => router.push(ROUTES.PROPERTY_COMPARE)}
            disabled={items.length < PROPERTY_COMPARE_MIN_ITEMS}
            className="min-w-40"
          >
            {t("cta")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCompareFloatingBar;
