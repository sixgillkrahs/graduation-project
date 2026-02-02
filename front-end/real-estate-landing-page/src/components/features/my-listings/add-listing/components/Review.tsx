"use client";

import { CsButton } from "@/components/custom";
import { Map } from "@/components/ui/Map";
import { Badge } from "@/components/ui/badge";
import { prevStep, resetListing } from "@/store/listing.store";
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
  LayoutGrid,
  MapPin,
  Rotate3d,
  Ruler,
  Sofa,
  Tag,
  Video,
} from "lucide-react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { useDispatch } from "react-redux";
import { ListingFormData } from "../../dto/listingformdata.dto";
import { useCreateProperty } from "../../services/mutate";
import PropertyService from "../../services/service";
import { Icon } from "@/components/ui";

const Review = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { mutateAsync: createProperty, isPending: isCreatingProperty } =
    useCreateProperty();
  const { getValues, handleSubmit } = useFormContext<ListingFormData>();
  const data = getValues();

  // Create preview URLs for images
  const imageUrls = useMemo(() => {
    return data.images || [];
  }, [data.images]);

  const [active360Index, setActive360Index] = React.useState(0);
  const virtualTourUrls = data.virtualTourUrls || [];

  const onBack = () => {
    dispatch(prevStep());
  };

  const onPublish = (formData: ListingFormData) => {
    createProperty(formData, {
      onSuccess: () => {
        toast.success("Listings created successfully! Wait for approval.");
        dispatch(resetListing());
        router.push("/agent/listings");
      },
      onError: (error) => {
        toast.error("Failed to create property. Please try again.");
        console.error(error);
      },
    });
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

        <div className="mb-0">
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

        {/* Section 5: Thumbnail & Video */}
        {(data.thumbnail || data.videoLink) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.thumbnail && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5" />
                  Thumbnail Image
                </h3>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200">
                  <NextImage
                    src={data.thumbnail}
                    alt="Property thumbnail"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {data.videoLink && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video Tour
                </h3>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 h-full flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100 text-red-600 rounded-full">
                      <Video className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-900 line-clamp-1">
                      {data.videoLink}
                    </span>
                  </div>
                  <a
                    href={data.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline pl-12"
                  >
                    Watch Video Tour &rarr;
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 6: 360 Virtual Tour */}
        {virtualTourUrls.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Rotate3d className="w-5 h-5" />
              360° Virtual Tour ({virtualTourUrls.length})
            </h3>
            <div className="bg-gray-50 rounded-xl p-0 overflow-hidden border border-gray-200">
              <div className="aspect-video w-full relative">
                <ReactPhotoSphereViewer
                  src={virtualTourUrls[active360Index]}
                  height={"100%"}
                  width={"100%"}
                />
                {virtualTourUrls.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10 px-4 overflow-x-auto">
                    {virtualTourUrls.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActive360Index(idx);
                        }}
                        className={`w-16 h-10 rounded border-2 overflow-hidden transition-all flex-shrink-0 ${
                          idx === active360Index
                            ? "border-white scale-110 shadow-lg"
                            : "border-white/50 hover:border-white/80 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={url}
                          alt={`360 thumbnail ${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section 7: Review */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Review & Confirm
          </h3>
          <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="relative w-full md:w-[320px] h-[240px] md:h-auto shrink-0">
                <NextImage
                  src={data.thumbnail}
                  alt="Property thumbnail"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <Badge className="bg-primary hover:bg-primary/90 text-white border-none px-3 py-1 shadow-sm">
                    {formatDemandType(data.demandType)}
                  </Badge>
                  {virtualTourUrls.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm border-none gap-1.5 pl-2 pr-3"
                    >
                      <Rotate3d className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-semibold">360° Tour</span>
                    </Badge>
                  )}
                  {data.videoLink && (
                    <Badge
                      variant="secondary"
                      className="bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm border-none gap-1.5 pl-2 pr-3"
                    >
                      <Video className="w-3.5 h-3.5 text-red-600" />
                      <span className="text-xs font-semibold">Video</span>
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-black/70 backdrop-blur-sm text-white border-white/20 px-3 py-1">
                    {formatPropertyType(data.propertyType)}
                  </Badge>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-bold text-xl text-gray-900 leading-tight line-clamp-2">
                        {data.title}
                      </h4>
                      <div className="text-2xl font-bold text-primary whitespace-nowrap">
                        {formatPrice(data.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="line-clamp-1">
                        {data.address}, {data.ward}, {data.province}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-4 border-y border-gray-100">
                    <div className="flex items-center gap-2 pr-4 border-r border-gray-100">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Icon.HotelBed className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {data.bedrooms} Beds
                        </p>
                        <p className="text-xs text-gray-500">Bedroom</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pr-4 border-r border-gray-100">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Icon.BathRoom className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {data.bathrooms} Baths
                        </p>
                        <p className="text-xs text-gray-500">Bathroom</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Icon.Shape className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {data.area} m²
                        </p>
                        <p className="text-xs text-gray-500">Area</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Ready to publish
                  </div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                    Preview Mode
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-6">
          <CsButton onClick={onBack} icon={<ArrowLeft />} type="button">
            Back
          </CsButton>
          <div className="flex gap-4">
            <CsButton type="button">Save Draft</CsButton>
            <CsButton
              onClick={handleSubmit(onPublish)}
              type="button"
              className="bg-green-600 hover:bg-green-700"
              loading={isCreatingProperty}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Publish Listing
            </CsButton>
          </div>
        </div>
      </div>

      {/* Section 4: Media */}
    </div>
  );
};

export default Review;
