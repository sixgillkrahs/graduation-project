import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { formatPropertyPrice } from "@/lib/property-price";

const TourViewer = dynamic(
  () => import("@/components/features/properties/detail/TourViewer"),
  { ssr: false },
);

interface ListingMediaProps {
  property: any;
}

export const ListingMedia = React.memo(({ property }: ListingMediaProps) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Main Image Banner */}
      <div className="w-full relative h-[400px] rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
        <Image
          src={
            property.media.images[0] ||
            property.media.thumbnail ||
            "https://via.placeholder.com/800"
          }
          alt="Main property view"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw"
          priority
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-lg font-bold text-blue-600 shadow-md">
          {formatPropertyPrice(
            property.features.price,
            property.features.priceUnit,
            property.features.currency,
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {property.media.images.slice(1, 6).map((img: string, idx: number) => (
          <div
            key={idx}
            className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative cursor-pointer hover:opacity-90 transition border border-gray-200"
          >
            <Image
              src={img}
              alt={`Gallery ${idx}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 20vw"
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Description</h3>
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
          {property.description || "No description provided."}
        </p>
      </div>

      {(property.media.videoLink ||
        (property.media.virtualTourUrls &&
          property.media.virtualTourUrls.length > 0)) && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-gray-800">
            Virtual Tour & Video
          </h3>

          {property.media.virtualTourUrls &&
            property.media.virtualTourUrls.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-600">
                  360° Virtual Tour
                </h4>
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative">
                  <TourViewer urls={property.media.virtualTourUrls} />
                </div>
              </div>
            )}

          {property.media.videoLink && (
            <div className="space-y-4 mt-6">
              <h4 className="text-sm font-semibold text-gray-600">
                Property Video
              </h4>
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <iframe
                  src={property.media.videoLink.replace("watch?v=", "embed/")}
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ListingMedia.displayName = "ListingMedia";
