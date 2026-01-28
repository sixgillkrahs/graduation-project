"use client";

import { CsButton } from "@/components/custom";
import { Map } from "@/components/ui/Map";
import { prevStep } from "@/store/listing.store";
import {
  ArrowLeft,
  Bath,
  Bed,
  Building2,
  CheckCircle,
  Compass,
  FileText,
  Home,
  Images,
  MapPin,
  Ruler,
  Sofa,
  Tag,
} from "lucide-react";
import NextImage from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { useDispatch } from "react-redux";
import { ListingFormData } from "../types";
import PropertyService from "../../services/service";

const Review = () => {
  const dispatch = useDispatch();
  const { getValues, handleSubmit } = useFormContext<ListingFormData>();
  const data = getValues();

  // Create preview URLs for images
  const imageUrls = useMemo(() => {
    return data.images || [];
  }, [data.images]);

  const onBack = () => {
    dispatch(prevStep());
  };

  const onPublish = (formData: ListingFormData) => {
    console.log("Publishing listing:", formData);
    // TODO: Call API to submit listing
  };

  // Format helpers
  const formatPrice = (price: string) => {
    if (!price) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const formatPropertyType = (type: string) => {
    const types: Record<string, string> = {
      APARTMENT: "Apartment",
      HOUSE: "House",
      VILLA: "Villa",
      LAND: "Land",
      STREET_HOUSE: "Street House",
    };
    return types[type] || type;
  };

  const formatDemandType = (type: string) => {
    return type === "RENT" ? "For Rent" : "For Sale";
  };

  const fullAddress = useMemo(() => {
    const parts = [data.address].filter(Boolean);
    return parts.join(", ") || "Not specified";
  }, [data.address]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-w-[700px]">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Review Your Listing
          </h2>
          <p className="text-gray-500 mt-1">
            Please review all the information before publishing your listing.
          </p>
        </div>

        {/* Section 1: Overview */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Overview
          </h3>
          <div className="bg-gray-50 rounded-xl p-5 grid grid-cols-3 gap-6">
            <div>
              <span className="text-sm text-gray-500 block mb-1">
                Listing Type
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full text-sm font-medium">
                <Tag className="w-4 h-4" />
                {formatDemandType(data.demandType)}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block mb-1">
                Property Type
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-800 rounded-full text-sm font-medium">
                <Home className="w-4 h-4" />
                {formatPropertyType(data.propertyType)}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block mb-1">
                Project Name
              </span>
              <span className="text-gray-900 font-medium">
                {data.projectName || "Not specified"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Location */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </h3>
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500 block mb-1">
                  Province / City
                </span>
                <span className="text-gray-900 font-medium">
                  {PropertyService.Provinces.find(
                    (p) => p.value === data.province,
                  )?.label ||
                    data.province ||
                    "Not specified"}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500 block mb-1">Ward</span>
                <span className="text-gray-900 font-medium">
                  {PropertyService.Wards.find((w) => w.value === data.ward)
                    ?.label ||
                    data.ward ||
                    "Not specified"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-500 block mb-1">
                  Address
                </span>
                <span className="text-gray-900 font-medium">{fullAddress}</span>
              </div>
            </div>
            {data.latitude && data.longitude && (
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <Map
                  latitude={data.latitude}
                  longitude={data.longitude}
                  height="200px"
                  interactive={false}
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Property Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Property Details
          </h3>
          <div className="bg-gray-50 rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Ruler className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Area</span>
                <span className="text-gray-900 font-semibold">
                  {data.area ? `${data.area} m²` : "N/A"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Tag className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Price</span>
                <span className="text-gray-900 font-semibold">
                  {formatPrice(data.price)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Bed className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Bedrooms</span>
                <span className="text-gray-900 font-semibold">
                  {data.bedrooms}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Bath className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Bathrooms</span>
                <span className="text-gray-900 font-semibold">
                  {data.bathrooms}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Compass className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Direction</span>
                <span className="text-gray-900 font-semibold">
                  {data.direction || "N/A"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 block">
                  Legal Status
                </span>
                <span className="text-gray-900 font-semibold">
                  {data.legalStatus || "N/A"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Sofa className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Furniture</span>
                <span className="text-gray-900 font-semibold">
                  {data.furniture || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Media */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Images className="w-5 h-5" />
            Images ({imageUrls.length})
          </h3>
          {imageUrls.length > 0 ? (
            <PhotoProvider>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {imageUrls.map((url, index) => (
                  <PhotoView key={url} src={url}>
                    <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted cursor-pointer hover:opacity-90 transition-opacity">
                      <NextImage
                        src={url}
                        alt={`Property image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </PhotoView>
                ))}
              </div>
            </PhotoProvider>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
              No images uploaded
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-6 border-t border-gray-100">
          <CsButton onClick={onBack} icon={<ArrowLeft />} type="button">
            Back
          </CsButton>
          <div className="flex gap-4">
            <CsButton type="button">Save Draft</CsButton>
            <CsButton
              onClick={handleSubmit(onPublish)}
              type="button"
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Publish Listing
            </CsButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
