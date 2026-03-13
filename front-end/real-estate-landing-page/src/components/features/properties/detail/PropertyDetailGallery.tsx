"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Images, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { PropertyDto } from "../dto/property.dto";

interface PropertyDetailGalleryProps {
  property: PropertyDto & { isFavorite: boolean };
  onOpenViewer: (index: number) => void;
}

const PropertyDetailGallery = ({
  property,
  onOpenViewer,
}: PropertyDetailGalleryProps) => {
  const t = useTranslations("PropertiesPage");
  const galleryCount = property.media.images?.length || 0;
  const totalPhotos = Math.max(
    galleryCount,
    property.media.thumbnail ? 1 : 0,
  );
  const hasVirtualTour = property.media.virtualTourUrls?.length > 0;

  return (
    <div className="grid h-[400px] grid-cols-1 gap-2 overflow-hidden rounded-2xl md:h-[500px] md:grid-cols-4">
      <div
        className="group relative h-full cursor-pointer md:col-span-2 md:row-span-2"
        onClick={() => onOpenViewer(0)}
      >
        <Image
          src={
            property.media.thumbnail ||
            property.media.images?.[0] ||
            "/placeholder.jpg"
          }
          alt={property.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge className="cs-bg-red font-semibold text-white hover:bg-emerald-700">
            {property.demandType === "sale"
              ? t("card.forSale")
              : t("card.forRent")}
          </Badge>
          {property.status === "verified" && (
            <Badge className="flex items-center gap-1 bg-blue-600 font-semibold text-white hover:bg-blue-700">
              <CheckCircle2 className="h-3 w-3" /> Verified
            </Badge>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent p-4 md:hidden">
          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1 text-white">
              <p className="text-sm font-semibold">
                {totalPhotos} {totalPhotos === 1 ? "photo" : "photos"}
              </p>
              <p className="text-xs text-white/80">
                Tap to browse the full gallery
              </p>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenViewer(0);
              }}
              className="flex min-h-11 items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-gray-900 shadow-lg transition-colors hover:bg-white"
            >
              <Images className="h-4 w-4 text-red-500" />
              {t("detail.viewAllPhotos")}
            </button>
          </div>
        </div>

        {hasVirtualTour && (
          <button className="absolute bottom-4 right-4 z-20 hidden items-center gap-2 rounded-lg bg-white px-4 py-2 font-bold text-gray-900 shadow-lg transition-colors hover:bg-gray-50 md:flex">
            <Video className="main-color-red h-5 w-5" />
            {t("detail.view3DTour")}
          </button>
        )}

        {hasVirtualTour && (
          <div className="absolute bottom-4 left-4 z-20 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white md:hidden">
            3D tour available
          </div>
        )}
      </div>

      <div className="hidden grid-cols-2 gap-2 md:col-span-2 md:row-span-2 md:grid">
        {property.media.images.slice(0, 4).map((image, index) => (
          <div
            key={`${image}-${index + 1}`}
            className="group relative h-full cursor-pointer overflow-hidden"
            onClick={() => onOpenViewer(index)}
          >
            <Image
              src={image}
              alt={`Gallery ${index + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {index === 3 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/50">
                <span className="text-lg font-bold text-white">
                  {t("detail.viewAllPhotos")}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyDetailGallery;
