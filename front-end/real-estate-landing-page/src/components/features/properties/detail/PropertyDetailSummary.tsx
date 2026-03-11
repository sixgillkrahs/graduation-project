"use client";

import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { LIST_PROVINCE, LIST_WARD, findOptionLabel } from "gra-helper";
import {
  Bath,
  Bed,
  Calendar as CalendarIcon,
  Compass,
  Map as MapIcon,
  Maximize,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { PropertyDto } from "../dto/property.dto";

interface PropertyDetailSummaryProps {
  property: PropertyDto & { isFavorite: boolean };
}

const PropertyDetailSummary = ({ property }: PropertyDetailSummaryProps) => {
  const t = useTranslations("PropertiesPage");

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
                date: format(new Date(property.createdAt), "MMM dd, yyyy"),
              })}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700"
          >
            {property.propertyType}
          </Badge>
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 text-blue-700"
          >
            {property.features.legalStatus}
          </Badge>
          <Badge
            variant="outline"
            className="border-orange-200 bg-orange-50 text-orange-700"
          >
            {property.features.furniture}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-y border-border py-6 md:grid-cols-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border/50 bg-muted p-2.5">
            <Bed className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("detail.bedrooms")}
            </p>
            <p className="font-bold text-foreground">
              {property.features.bedrooms}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border/50 bg-muted p-2.5">
            <Bath className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("detail.bathrooms")}
            </p>
            <p className="font-bold text-foreground">
              {property.features.bathrooms}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border/50 bg-muted p-2.5">
            <Maximize className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("detail.area")}</p>
            <p className="font-bold text-foreground">
              {property.features.area} m2
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border/50 bg-muted p-2.5">
            <Compass className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("detail.direction")}
            </p>
            <p className="font-bold capitalize text-foreground">
              {property.features.direction || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyDetailSummary;
