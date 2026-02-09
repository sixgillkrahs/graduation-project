"use client";

import { Bath, Bed, Heart, MapPin, Maximize, User, Video } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  price: string;
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
}

const PropertyCard = ({
  image,
  title,
  price,
  unit = "month",
  address,
  specs,
  badges,
  agent,
  postedAt,
  className,
}: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div
      className={cn(
        "group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full relative",
        className,
      )}
    >
      {/* Image Container */}
      <div className="relative h-64 w-full overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />

        {/* Top Overlay: Badges & Heart */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          {badges?.aiRecommended && (
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 backdrop-blur-md">
              ✨ AI Pick
            </span>
          )}
          <span className="bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-bold px-2 py-1 rounded-lg">
            For Rent
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-gray-500 hover:text-red-500 transition-all shadow-sm z-10"
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-transform active:scale-90",
              isFavorite && "fill-current text-red-500",
            )}
          />
        </button>

        {/* Bottom Overlay: 3D Tour Badge */}
        {badges?.tour3D && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/10 hover:bg-black/80 transition-colors">
              <Video className="w-3 h-3" />
              3D Tour
            </span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Price & Title */}
        <div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-xl md:text-2xl font-bold text-emerald-600">
              {price}
            </span>
            {unit && (
              <span className="text-sm font-medium text-gray-400">/{unit}</span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
            <span className="truncate">{address}</span>
          </div>
        </div>

        {/* Specs Row */}
        <div className="flex items-center gap-4 py-3 border-t border-b border-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Bed className="w-4 h-4 text-emerald-500" />
            <span className="font-medium">{specs.beds} Beds</span>
          </div>
          <div className="w-[1px] h-4 bg-gray-200"></div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Bath className="w-4 h-4 text-emerald-500" />
            <span className="font-medium">{specs.baths} Baths</span>
          </div>
          <div className="w-[1px] h-4 bg-gray-200"></div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Maximize className="w-4 h-4 text-emerald-500" />
            <span className="font-medium">{specs.area} m²</span>
          </div>
        </div>

        {/* Footer: Agent & Date */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 border border-gray-100">
              {agent.avatar ? (
                <Image
                  src={agent.avatar}
                  alt={agent.name}
                  width={24}
                  height={24}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  {agent.name.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-gray-600">
              {agent.name}
            </span>
          </div>
          <span className="text-xs text-gray-400 font-medium">{postedAt}</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
