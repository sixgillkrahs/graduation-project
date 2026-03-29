"use client";

import { findOptionLabel, LIST_PROVINCE, LIST_WARD } from "gra-helper";
import {
  Armchair,
  Bath,
  Bed,
  Calendar as CalendarIcon,
  Compass,
  ShieldCheck,
  Map as MapIcon,
  Maximize,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactElement } from "react";
import { Badge } from "@/components/ui/badge";
import { formatPropertyPostedDate } from "@/lib/property-date";
import type { PropertyCompareItem } from "../compare/compare.types";
import PropertyCompareToggleButton from "../compare/PropertyCompareToggleButton";
import type { PropertyDto } from "../dto/property.dto";
import ShareListingButton from "./ShareListingButton";

interface PropertyDetailSummaryProps {
  property: PropertyDto & { isFavorite: boolean };
  compareItem: PropertyCompareItem;
  displayPrice: string;
}

type PropertyStat = {
  key: string;
  icon: ReactElement;
  label: string;
  value: number | string;
  valueClassName?: string;
};

const formatFallbackLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const PropertyDetailSummary = ({
  property,
  compareItem,
  displayPrice,
}: PropertyDetailSummaryProps) => {
  const t = useTranslations("PropertiesPage");
  const locale = useLocale();
  const demandType = property.demandType?.trim().toLowerCase();
  const legalStatus = property.features.legalStatus?.trim();
  const furniture = property.features.furniture?.trim();
  const direction = property.features.direction?.trim();
  const propertyTypeKeyMap: Record<string, string> = {
    APARTMENT: "search.typeApartment",
    HOUSE: "search.typeHouse",
    STREET_HOUSE: "search.typeStreetHouse",
    VILLA: "search.typeVilla",
    LAND: "search.typeLand",
    OTHER: "search.typeOther",
  };
  const directionKeyMap: Record<string, string> = {
    NORTH: "filter.north",
    SOUTH: "filter.south",
    EAST: "filter.east",
    WEST: "filter.west",
    NORTH_EAST: "filter.northEast",
    NORTH_WEST: "filter.northWest",
    SOUTH_EAST: "filter.southEast",
    SOUTH_WEST: "filter.southWest",
  };
  const legalStatusKeyMap: Record<string, string> = {
    PINK_BOOK: "detail.legalPinkBook",
    RED_BOOK: "detail.legalRedBook",
    SALE_CONTRACT: "detail.legalSaleContract",
    WAITING: "detail.legalWaiting",
    OTHER: "detail.legalOther",
  };
  const furnitureKeyMap: Record<string, string> = {
    FULL: "detail.furnitureFull",
    BASIC: "detail.furnitureBasic",
    EMPTY: "detail.furnitureEmpty",
  };

  const propertyTypeLabel = property.propertyType
    ? propertyTypeKeyMap[property.propertyType]
      ? t(propertyTypeKeyMap[property.propertyType])
      : formatFallbackLabel(property.propertyType)
    : "";
  const directionLabel = direction
    ? directionKeyMap[direction]
      ? t(directionKeyMap[direction])
      : formatFallbackLabel(direction)
    : "";
  const legalStatusLabel = legalStatus
    ? legalStatusKeyMap[legalStatus]
      ? t(legalStatusKeyMap[legalStatus])
      : formatFallbackLabel(legalStatus)
    : "";
  const furnitureLabel = furniture
    ? furnitureKeyMap[furniture]
      ? t(furnitureKeyMap[furniture])
      : formatFallbackLabel(furniture)
    : "";

  const propertyStatItems: Array<PropertyStat | null> = [
    property.features.bedrooms > 0
      ? {
          key: "bedrooms",
          icon: <Bed className="h-6 w-6 text-primary" />,
          label: t("detail.bedrooms"),
          value: property.features.bedrooms,
        }
      : null,
    property.features.bathrooms > 0
      ? {
          key: "bathrooms",
          icon: <Bath className="h-6 w-6 text-primary" />,
          label: t("detail.bathrooms"),
          value: property.features.bathrooms,
        }
      : null,
    property.features.area > 0
      ? {
          key: "area",
          icon: <Maximize className="h-6 w-6 text-primary" />,
          label: t("detail.area"),
          value: `${property.features.area} m2`,
        }
      : null,
    demandType === "sale" && legalStatusLabel
      ? {
          key: "legal-status",
          icon: <ShieldCheck className="h-6 w-6 text-primary" />,
          label: t("detail.legal"),
          value: legalStatusLabel,
        }
      : null,
    furniture &&
    !["none", "empty"].includes(furniture.toLowerCase()) &&
    furnitureLabel
      ? {
          key: "furniture",
          icon: <Armchair className="h-6 w-6 text-primary" />,
          label: t("detail.furniture"),
          value: furnitureLabel,
        }
      : null,
    directionLabel
      ? {
          key: "direction",
          icon: <Compass className="h-6 w-6 text-primary" />,
          label: t("detail.direction"),
          value: directionLabel,
        }
      : null,
  ];
  const propertyStats = propertyStatItems.filter(
    (stat): stat is PropertyStat => stat !== null,
  );

  return (
    <>
      <div className="space-y-4">
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <span className="cursor-pointer hover:text-emerald-600">
            {t("detail.home")}
          </span>
          <span>/</span>
          <span className="cursor-pointer hover:text-emerald-600">
            {findOptionLabel(property.location.province, LIST_PROVINCE)}
          </span>
          <span>/</span>
          <span className="cursor-pointer hover:text-emerald-600">
            {findOptionLabel(property.location.ward, LIST_WARD)}
          </span>
        </nav>

        <h1 className="text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
          {property.title}
        </h1>

        <div className="flex flex-col gap-4 text-muted-foreground md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gray-100 p-1.5">
              <MapIcon className="h-4 w-4 text-gray-600" />
            </div>
            <span>
              {property.location.address},{" "}
              {findOptionLabel(property.location.ward, LIST_WARD)},{" "}
              {findOptionLabel(property.location.province, LIST_PROVINCE)}
            </span>
          </div>

          <div className="hidden h-1 w-1 rounded-full bg-gray-300 md:block" />

          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>
              {t("detail.posted", {
                date: formatPropertyPostedDate(property.createdAt, locale),
              })}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {propertyTypeLabel ? (
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-emerald-700"
            >
              {propertyTypeLabel}
            </Badge>
          ) : null}
          <PropertyCompareToggleButton item={compareItem} />
          <ShareListingButton
            property={property}
            displayPrice={displayPrice}
            align="start"
            className="rounded-full border border-border bg-background px-3 py-1.5 text-foreground hover:border-primary/30 hover:bg-primary/5"
          />
        </div>
      </div>

      {propertyStats.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 border-y border-border py-6 sm:grid-cols-2 lg:grid-cols-3">
          {propertyStats.map((stat) => (
            <div key={stat.key} className="flex items-center gap-3">
              <div className="rounded-lg border border-border/50 bg-muted p-2.5">
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p
                  className={`font-bold text-foreground ${stat.valueClassName || ""}`.trim()}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
};

export default PropertyDetailSummary;
