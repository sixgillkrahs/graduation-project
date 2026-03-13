"use client";

import { Bath, Bed, Heart, MapPin, Maximize, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { PropertyCompareItem } from "@/components/features/properties/compare/compare.types";
import PropertyCompareToggleButton from "@/components/features/properties/compare/PropertyCompareToggleButton";
import { ROUTES } from "@/const/routes";
import { useAppDispatch } from "@/lib/hooks";
import { formatPropertyPrice } from "@/lib/property-price";
import { queryClient } from "@/lib/react-query/queryClient";
import { cn } from "@/lib/utils";
import { showAuthDialog } from "@/store/auth-dialog.store";
import { PropertyQueryKey } from "../services/config";
import { useRecordInteraction } from "../services/mutate";

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
  };
  postedAt: string;
  className?: string;
  type: "rent" | "sale";
  isFavorite: boolean;
  compareItem: PropertyCompareItem;
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
}: PropertyCardProps) => {
  const dispatch = useAppDispatch();
  const { mutateAsync: recordInteraction } = useRecordInteraction();
  const t = useTranslations("PropertiesPage");
  const displayPrice = formatPropertyPrice(Number(price), unit, currency);

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
        <div className="relative h-64 w-full overflow-hidden bg-gray-100">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />

          <div className="absolute left-3 top-3 z-10 flex gap-2">
            {badges?.aiRecommended && (
              <span className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-2 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-md">
                âœ¨ {t("card.aiPick")}
              </span>
            )}
            <span className="rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-gray-800 backdrop-blur-md">
              {type === "rent" ? t("card.forRent") : t("card.forSale")}
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
          <div>
            <div className="mb-1 flex items-baseline gap-1">
              <span className="main-color-red text-xl font-bold md:text-2xl">
                {displayPrice}
              </span>
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
              <span className="font-medium">{specs.area} mÂ²</span>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
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
              <span className="text-xs font-medium text-gray-600">
                {agent?.name}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-400">
              {t("detail.posted", { date: postedAt })}
            </span>
          </div>
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
