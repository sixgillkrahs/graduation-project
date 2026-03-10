import { format } from "date-fns";
import { Bath, Bed, Clock, Eye, Maximize, Tag, TrendingUp } from "lucide-react";
import React from "react";
import { getPropertyAmenityLabel } from "@/lib/property-amenities";
import type { IPropertyDto } from "../../dto/property.dto";

interface ListingStatsProps {
  property: IPropertyDto;
}

export const ListingStats = React.memo(({ property }: ListingStatsProps) => {
  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Analytics
        </h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">
              Total Views
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {property.viewCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-400 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Created on {format(new Date(property.createdAt), "dd MMM yyyy")}
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Features</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Maximize className="w-5 h-5 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Area</span>
              <span className="font-medium text-gray-900">
                {property.features.area} m²
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Bed className="w-5 h-5 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Bedrooms</span>
              <span className="font-medium text-gray-900">
                {property.features.bedrooms || 0}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Bath className="w-5 h-5 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Bathrooms</span>
              <span className="font-medium text-gray-900">
                {property.features.bathrooms || 0}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Tag className="w-5 h-5 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Property Type</span>
              <span
                className="font-medium text-gray-900 truncate"
                title={property.propertyType}
              >
                {property.propertyType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      {property.amenities && property.amenities.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {property.amenities.map((amenity: string) => (
              <span
                key={amenity}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-100"
              >
                {getPropertyAmenityLabel(amenity)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ListingStats.displayName = "ListingStats";
