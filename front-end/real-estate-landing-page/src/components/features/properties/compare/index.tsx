"use client";

import { findOptionLabel, LIST_PROVINCE, LIST_WARD } from "gra-helper";
import {
  Bath,
  Bed,
  Columns2,
  MapPin,
  Maximize,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import StateSurface from "@/components/ui/state-surface";
import { ROUTES } from "@/const/routes";
import {
  formatPropertyPrice,
  formatPropertyPricePerSqm,
} from "@/lib/property-price";
import {
  PROPERTY_COMPARE_MIN_ITEMS,
  type PropertyCompareItem,
} from "./compare.types";
import {
  buildCompareAmenityLabels,
  buildCompareLocationLabel,
} from "./compare.utils";
import {
  usePropertyCompare,
  usePropertyCompareActions,
} from "./usePropertyCompare";

const ComparePage = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("PropertiesPage.compare");
  const { items, hydrated } = usePropertyCompare();
  const { clearItems, removeItem } = usePropertyCompareActions();

  const rows: Array<{
    key: string;
    label: string;
    icon: ReactNode;
    render: (item: PropertyCompareItem) => ReactNode;
  }> = [
    {
      key: "price",
      label: t("rows.price"),
      icon: <Sparkles className="h-4 w-4" />,
      render: (item) =>
        formatPropertyPrice(item.price, item.priceUnit, item.currency, locale),
    },
    {
      key: "pricePerSqm",
      label: t("rows.pricePerSqm"),
      icon: <Maximize className="h-4 w-4" />,
      render: (item) =>
        formatPropertyPricePerSqm(
          item.price,
          item.priceUnit,
          item.area,
          item.currency,
          locale,
        ) || "N/A",
    },
    {
      key: "area",
      label: t("rows.area"),
      icon: <Maximize className="h-4 w-4" />,
      render: (item) => `${item.area || 0} m2`,
    },
    {
      key: "bedrooms",
      label: t("rows.bedrooms"),
      icon: <Bed className="h-4 w-4" />,
      render: (item) => item.bedrooms || "-",
    },
    {
      key: "bathrooms",
      label: t("rows.bathrooms"),
      icon: <Bath className="h-4 w-4" />,
      render: (item) => item.bathrooms || "-",
    },
    {
      key: "legalStatus",
      label: t("rows.legal"),
      icon: <ShieldCheck className="h-4 w-4" />,
      render: (item) => item.legalStatus || "N/A",
    },
    {
      key: "furniture",
      label: t("rows.furniture"),
      icon: <Sparkles className="h-4 w-4" />,
      render: (item) => item.furniture || "N/A",
    },
    {
      key: "amenities",
      label: t("rows.amenities"),
      icon: <Sparkles className="h-4 w-4" />,
      render: (item) => {
        const labels = buildCompareAmenityLabels(item);

        if (labels.length === 0) {
          return "N/A";
        }

        return (
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <span
                key={`${item.id}-${label}`}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700"
              >
                {label}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "location",
      label: t("rows.location"),
      icon: <MapPin className="h-4 w-4" />,
      render: (item) => (
        <div className="space-y-1 text-sm text-stone-700">
          <p className="font-medium">
            {buildCompareLocationLabel(item) || "N/A"}
          </p>
          <p className="text-xs text-stone-500">
            {findOptionLabel(item.ward, LIST_WARD)}
            {item.ward && item.province ? ", " : ""}
            {findOptionLabel(item.province, LIST_PROVINCE)}
          </p>
        </div>
      ),
    },
    {
      key: "virtualTour",
      label: t("rows.virtualTour"),
      icon: <Columns2 className="h-4 w-4" />,
      render: (item) => (item.hasVirtualTour ? t("yes") : t("no")),
    },
  ];

  if (!hydrated) {
    return null;
  }

  if (items.length < PROPERTY_COMPARE_MIN_ITEMS) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-8">
        <div className="container mx-auto px-4 md:px-20">
          <StateSurface
            tone="brand"
            eyebrow={t("empty.eyebrow")}
            icon={<Columns2 className="h-6 w-6" />}
            title={t("empty.title")}
            description={t("empty.description")}
            primaryAction={{
              label: t("empty.cta"),
              onClick: () => router.push(ROUTES.PROPERTIES),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f1e8_0%,#fafafa_28%,#ffffff_100%)] pb-28">
      <div className="container mx-auto px-4 py-8 md:px-20">
        <section className="rounded-[32px] border border-stone-200 bg-[linear-gradient(135deg,#1c1917_0%,#292524_55%,#44403c_100%)] p-6 text-white shadow-[0_30px_80px_rgba(28,25,23,0.28)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
                {t("hero.eyebrow")}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                {t("hero.title")}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
                {t("hero.description")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href={ROUTES.PROPERTIES}>{t("continueBrowsing")}</Link>
              </Button>
              <Button
                type="button"
                onClick={clearItems}
                className="bg-white text-stone-900 hover:bg-stone-100"
              >
                {t("clear")}
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1024px] w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 w-72 border-b border-r border-stone-200 bg-stone-950 px-6 py-5 text-left align-top text-sm font-semibold uppercase tracking-[0.18em] text-stone-100">
                    {t("table.featureColumn")}
                  </th>
                  {items.map((item) => (
                    <th
                      key={item.id}
                      className="min-w-72 border-b border-stone-200 bg-stone-50 px-5 py-5 text-left align-top"
                    >
                      <div className="space-y-4">
                        <div className="relative h-44 overflow-hidden rounded-2xl">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="288px"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                            {item.demandType}
                          </p>
                          <h2 className="line-clamp-2 text-xl font-semibold text-stone-900">
                            {item.title}
                          </h2>
                          <p className="line-clamp-2 text-sm text-stone-600">
                            {buildCompareLocationLabel(item)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button asChild size="sm">
                            <Link href={ROUTES.PROPERTY_DETAIL(item.id)}>
                              {t("viewDetail")}
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            {t("remove")}
                          </Button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={row.key}>
                    <th
                      className={`sticky left-0 z-10 w-72 border-r border-stone-200 px-6 py-5 text-left align-top ${
                        rowIndex % 2 === 0 ? "bg-white" : "bg-stone-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-stone-800">
                        <span className="rounded-full bg-stone-100 p-2 text-stone-600">
                          {row.icon}
                        </span>
                        <span className="font-semibold">{row.label}</span>
                      </div>
                    </th>
                    {items.map((item, itemIndex) => (
                      <td
                        key={`${row.key}-${item.id}`}
                        className={`border-l border-stone-100 px-5 py-5 align-top text-sm ${
                          rowIndex % 2 === 0 ? "bg-white" : "bg-stone-50"
                        } ${itemIndex === 0 ? "border-l-0" : ""}`}
                      >
                        {row.render(item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ComparePage;
