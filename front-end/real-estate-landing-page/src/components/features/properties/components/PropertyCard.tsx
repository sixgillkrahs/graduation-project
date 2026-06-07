"use client";

import {
  ArrowRight,
  Bath,
  Bed,
  Heart,
  MapPin,
  Maximize,
  Sparkles,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { PropertyCompareItem } from "@/components/features/properties/compare/compare.types";
import PropertyCompareToggleButton from "@/components/features/properties/compare/PropertyCompareToggleButton";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/const/routes";
import { useAppDispatch } from "@/lib/hooks";
import { formatPropertyPrice } from "@/lib/property-price";
import { queryClient } from "@/lib/react-query/queryClient";
import { cn } from "@/lib/utils";
import { showAuthDialog } from "@/store/auth-dialog.store";
import { PropertyQueryKey } from "../services/config";
import { useRecordInteraction } from "../services/mutate";
import { CsButton } from "@/components/custom";

export interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  price: string;
  currency?: "VND" | "USD";
  unit?: string;
  address: string;
  specs: {
    beds: number;
    baths: number;
    area: number; // m2
  };
  badges?: {
    aiRecommended?: boolean;
    tour3D?: boolean;
  };
  agent: {
    name: string;
    avatar?: string;
    isPro?: boolean;
    plan?: "BASIC" | "PRO";
  };
  postedAt: string;
  className?: string;
  type: "rent" | "sale";
  isFavorite: boolean;
  compareItem: PropertyCompareItem;
  reasons?: string[];
  scoreLabel?: string;
  ctaLabel?: string;
}

const PropertyCard = ({
  image,
  title,
  price,
  currency = "VND",
  unit = "month",
  address,
  specs,
  badges,
  agent,
  postedAt,
  className,
  type,
  id,
  isFavorite,
  compareItem,
  reasons,
  scoreLabel,
  ctaLabel,
}: PropertyCardProps) => {
  const dispatch = useAppDispatch();
  const { mutateAsync: recordInteraction } = useRecordInteraction();
  const t = useTranslations("PropertiesPage");
  const locale = useLocale();
  const isRent = type === "rent";
  const listingTypeLabel = isRent ? t("card.forRent") : t("card.forSale");
  const priceLabel = isRent
    ? t("card.priceRentLabel")
    : t("card.priceSaleLabel");
  const priceHint = isRent ? t("card.priceRentHint") : t("card.priceSaleHint");
  const displayPrice = formatPropertyPrice(
    Number(price),
    unit,
    currency,
    locale,
  );

  const handleToggleFavorite = async () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      dispatch(
        showAuthDialog({
          title: t("card.loginToSave"),
          description: t("card.loginToSaveDesc"),
        }),
      );
      return;
    }

    const metadata = {
      action: isFavorite ? "UNSAVE" : "SAVE",
    };

    await recordInteraction({ id, type: "FAVORITE", metadata });
    queryClient.invalidateQueries({ queryKey: [PropertyQueryKey.onSale] });
    queryClient.invalidateQueries({ queryKey: [PropertyQueryKey.favorites] });
    queryClient.invalidateQueries({
      queryKey: [PropertyQueryKey.semanticSearch],
    });
    queryClient.invalidateQueries({
      queryKey: [PropertyQueryKey.semanticSearchExplain],
    });
  };

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:shadow-xl",
        className,
      )}
    >
      <button
        type="button"
        onClick={handleToggleFavorite}
        className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-2 text-gray-500 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-red-500"
      >
        <Heart
          className={cn(
            "h-5 w-5 transition-transform active:scale-90",
            isFavorite && "fill-current text-red-500",
          )}
        />
      </button>

      <Link href={ROUTES.PROPERTY_DETAIL(id)} className="flex h-full flex-col">
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 p-2 rounded-2xl"
          />

          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
            {badges?.aiRecommended && (
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg backdrop-blur-md">
                {t("card.aiPick")}
              </span>
            )}
            <span
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] shadow-lg backdrop-blur-md",
                isRent
                  ? "border-sky-200 bg-sky-500/95 text-white"
                  : "border-amber-200 bg-amber-500/95 text-white",
              )}
            >
              {listingTypeLabel}
            </span>
          </div>

          {badges?.tour3D && (
            <div className="absolute bottom-3 left-3">
              <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md transition-colors hover:bg-black/80">
                <Video className="h-3 w-3" />
                3D Tour
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <span className="text-[20px] font-bold"> {displayPrice}</span>
                <span className="text-gray-600">
                  {type !== "sale" && "/month"}
                </span>
              </span>
              {scoreLabel ? (
                <Badge className="rounded-full bg-stone-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                  <Sparkles className="h-3 w-3" />
                  {scoreLabel}
                </Badge>
              ) : null}
            </div>

            <h3 className="line-clamp-1 font-semibold text-gray-900 transition-colors group-hover:text-red-500">
              {title}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
              <span className="truncate">{address}</span>
            </div>
          </div>

          <div className="flex flex-nowrap items-center justify-between border-y border-gray-50 py-3">
            <div className="flex items-center gap-1.5 whitespace-nowrap text-sm text-gray-600">
              <Bed className="main-color-red h-4 w-4 shrink-0" />
              <span className="font-medium">
                {specs.beds} {t("beds")}
              </span>
            </div>
            <div className="h-4 w-px shrink-0 bg-gray-200"></div>
            <div className="flex items-center gap-1.5 whitespace-nowrap text-sm text-gray-600">
              <Bath className="main-color-red h-4 w-4 shrink-0" />
              <span className="font-medium">
                {specs.baths} {t("baths")}
              </span>
            </div>
            <div className="h-4 w-px shrink-0 bg-gray-200"></div>
            <div className="flex items-center gap-1.5 whitespace-nowrap text-sm text-gray-600">
              <Maximize className="main-color-red h-4 w-4 shrink-0" />
              <span className="font-medium">{specs.area} m²</span>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 pt-1">
            <div className="flex min-w-0 items-center gap-2">
              <div className="h-6 w-6 overflow-hidden rounded-full border border-gray-100 bg-gray-200">
                {agent.avatar ? (
                  <Image
                    src={agent.avatar}
                    alt={agent.name}
                    width={24}
                    height={24}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-[10px] font-bold text-emerald-700">
                    {agent?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <span className="truncate text-xs font-medium text-gray-600">
                {agent?.name}
              </span>
              {agent.isPro || agent.plan === "PRO" ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700"
                >
                  PRO
                </Badge>
              ) : null}
            </div>
            <span className="text-right text-xs font-medium text-gray-400">
              {t("detail.posted", { date: postedAt })}
            </span>
          </div>

          {reasons?.length ? (
            <div className="flex flex-wrap gap-2 rounded-2xl border border-stone-100 bg-stone-50 p-3">
              {reasons.slice(0, 3).map((reason) => (
                <span
                  key={reason}
                  className="inline-flex items-center rounded-full border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700"
                >
                  {reason}
                </span>
              ))}
            </div>
          ) : null}

          {ctaLabel ? (
            <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800">
              <span>{ctaLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          ) : null}
        </div>
      </Link>

      <div className="px-4 pb-4">
        <PropertyCompareToggleButton
          item={compareItem}
          className="w-full justify-center"
        />
      </div>
    </article>
  );
};

export default PropertyCard;
