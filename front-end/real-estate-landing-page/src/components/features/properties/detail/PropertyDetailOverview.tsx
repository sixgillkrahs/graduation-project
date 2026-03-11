"use client";

import { getPropertyAmenityDisplay } from "@/lib/property-amenities";
import dynamic from "next/dynamic";
import { Video } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { PropertyDto } from "../dto/property.dto";

const TourViewer = dynamic(() => import("./TourViewer"), { ssr: false });
const StaticPropertyMap = dynamic(
  () => import("@/components/ui/Map").then((mod) => mod.Map),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 animate-pulse bg-muted/40" />
    ),
  },
);

type AmenityDisplay = ReturnType<typeof getPropertyAmenityDisplay>;

interface PropertyDetailOverviewProps {
  property: PropertyDto & { isFavorite: boolean };
  amenities: AmenityDisplay[];
  show3D: boolean;
  onShow3D: () => void;
}

const PropertyDetailOverview = ({
  property,
  amenities,
  show3D,
  onShow3D,
}: PropertyDetailOverviewProps) => {
  const t = useTranslations("PropertiesPage");

  return (
    <>
      {property.media.virtualTourUrls?.length > 0 && (
        <section className="scroll-mt-24" id="virtual-tour">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            <Video className="main-color-red h-6 w-6" />
            {t("detail.virtualTour")}
          </h3>
          <div className="relative aspect-[2/1] overflow-hidden rounded-2xl bg-gray-900 shadow-lg">
            {!show3D ? (
              <div
                className="group relative h-full w-full cursor-pointer"
                onClick={onShow3D}
              >
                <Image
                  src={property.media.thumbnail}
                  alt="3D Tour Preview"
                  fill
                  className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-colors duration-300 group-hover:bg-red-600">
                    <Video className="h-8 w-8 fill-current text-white" />
                  </div>
                  <div className="text-center">
                    <h4 className="mb-1 text-xl font-bold text-white">
                      {t("detail.clickExplore")}
                    </h4>
                    <p className="text-sm text-white/80">
                      {t("detail.walkThrough")}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <TourViewer urls={property.media.virtualTourUrls} />
            )}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-4 text-xl font-bold text-foreground">
          {t("detail.description")}
        </h3>
        <div className="prose prose-emerald max-w-none leading-relaxed text-muted-foreground">
          <p>{property.description}</p>
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-gray-50 pt-3 text-xs italic text-gray-400">
          <span>{t("detail.aiEnhanced")}</span>
        </div>
      </section>

      {amenities.length > 0 && (
        <section>
          <h3 className="mb-6 text-xl font-bold text-gray-900">
            {t("detail.amenities")}
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3">
            {amenities.map((item) => (
              <div key={item.value} className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium text-gray-700">
                  {item.translationKey ? t(item.translationKey) : item.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-4 text-xl font-bold text-gray-900">
          {t("detail.locationOnMap")}
        </h3>
        <div className="relative flex h-[300px] w-full items-center justify-center overflow-hidden rounded-2xl border border-red-100 bg-red-50">
          <div className="absolute inset-0 opacity-10 [background-size:16px_16px] bg-[radial-gradient(#10b981_1px,transparent_1px)]" />
          <StaticPropertyMap
            latitude={property.location.coordinates.lat}
            longitude={property.location.coordinates.long}
            interactive={false}
            onLocationSelect={undefined}
            height="300px"
          />
        </div>
      </section>
    </>
  );
};

export default PropertyDetailOverview;
