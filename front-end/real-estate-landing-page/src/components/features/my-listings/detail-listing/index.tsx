"use client";

import {
  useGetPropertyDetail,
  useUpdatePropertyStatus,
} from "@/components/features/my-listings/services/query";
import { CsButton } from "@/components/custom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dropdown, DropdownItem, Icon } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  MapPin,
  Tag,
  Bed,
  Bath,
  Maximize,
  Clock,
  CheckCircle,
  Eye,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import Image from "next/image";

const TourViewer = dynamic(
  () => import("@/components/features/properties/detail/TourViewer"),
  { ssr: false },
);

export const ListingDetail = () => {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;

  const { data, isLoading, refetch } = useGetPropertyDetail(propertyId);
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdatePropertyStatus();

  const [isSoldModalOpen, setIsSoldModalOpen] = useState(false);
  const [soldPrice, setSoldPrice] = useState("");
  const [soldTo, setSoldTo] = useState("");

  const property = data?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-20 p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Property Not Found</h2>
        <p className="text-gray-500 mt-2 text-center">
          The property you are looking for does not exist or you don't have
          permission to view it.
        </p>
        <button
          onClick={() => router.push("/agent/listings")}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  const handleUpdateStatus = (
    newStatus: "PUBLISHED" | "SOLD" | "EXPIRED",
    extraData?: { soldPrice?: number; soldTo?: string },
  ) => {
    updateStatus(
      { id: propertyId, status: newStatus, ...extraData },
      {
        onSuccess: () => {
          toast.success(`Property marked as ${newStatus.toLowerCase()}`);
          if (newStatus === "SOLD") setIsSoldModalOpen(false);
          refetch();
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || "Failed to update property status",
          );
        },
      },
    );
  };

  const handleConfirmSold = () => {
    if (!soldPrice) {
      toast.error("Please enter the sold price");
      return;
    }
    handleUpdateStatus("SOLD", {
      soldPrice: Number(soldPrice),
      soldTo: soldTo,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-700 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "DRAFT":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      case "SOLD":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "EXPIRED":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1
              className="text-2xl font-bold text-gray-900 border-b-2 border-transparent hover:border-blue-600 transition cursor-pointer"
              onClick={() => router.push(`/properties/${propertyId}`)}
            >
              {property.title}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                property.status,
              )}`}
            >
              {property.status}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500 gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            {property.location.address}, {property.location.ward},{" "}
            {property.location.province}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/agent/listings`)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Back
          </button>

          {(property.status === "PUBLISHED" ||
            property.status === "SOLD" ||
            property.status === "EXPIRED") && (
            <Dropdown
              width={220}
              placement="bottom"
              trigger={
                <button
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 border border-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                >
                  <Icon.Settings className="w-4 h-4" />
                  {isUpdating ? "Updating..." : "Change Status"}
                </button>
              }
            >
              <div className="py-2 z-50">
                {property.status !== "SOLD" && (
                  <DropdownItem onClick={() => setIsSoldModalOpen(true)}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Mark as Sold
                    </div>
                  </DropdownItem>
                )}
                {property.status !== "PUBLISHED" && (
                  <DropdownItem onClick={() => handleUpdateStatus("PUBLISHED")}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Mark as Published
                    </div>
                  </DropdownItem>
                )}
                {property.status !== "EXPIRED" && (
                  <DropdownItem
                    onClick={() => handleUpdateStatus("EXPIRED")}
                    danger
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Hide (Expired)
                    </div>
                  </DropdownItem>
                )}
              </div>
            </Dropdown>
          )}

          <button
            onClick={() => router.push(`/agent/listings/edit/${propertyId}`)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
          >
            <Icon.Edit className="w-4 h-4" />
            Edit Property
          </button>
        </div>
      </div>

      {property.rejectReason && property.status === "REJECTED" && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="flex flex-col text-sm">
            <span className="font-semibold">Property Rejected by Admin</span>
            <span>Reason: {property.rejectReason}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Images & Major info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image Banner */}
          <div className="w-full relative h-[400px] rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
            <img
              src={
                property.media.images[0] ||
                property.media.thumbnail ||
                "https://via.placeholder.com/800"
              }
              alt="Main property view"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-lg font-bold text-blue-600 shadow-md">
              {property.features.price} {property.features.priceUnit}
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {property.media.images.slice(1, 6).map((img, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative cursor-pointer hover:opacity-90 transition border border-gray-200"
              >
                <img
                  src={img}
                  alt={`Gallery ${idx}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Description
            </h3>
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
                      src={property.media.videoLink.replace(
                        "watch?v=",
                        "embed/",
                      )}
                      className="w-full h-full"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column: Stats and Features */}
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
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Amenities
              </h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-100"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isSoldModalOpen} onOpenChange={setIsSoldModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Property as Sold</DialogTitle>
            <DialogDescription>
              To help track your sales KPIs and generate better analytics,
              please provide the sale price and the customer's name (optional).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Sale Price ({property.features.priceUnit}){" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="E.g. 5.5"
                value={soldPrice}
                onChange={(e) => setSoldPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Sold To (Customer Name / Phone)
              </label>
              <Input
                type="text"
                placeholder="E.g. John Doe 0987654321"
                value={soldTo}
                onChange={(e) => setSoldTo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <CsButton
              variant="outline"
              onClick={() => setIsSoldModalOpen(false)}
            >
              Cancel
            </CsButton>
            <CsButton
              className="bg-blue-600 text-white"
              onClick={handleConfirmSold}
              loading={isUpdating}
            >
              Confirm Sold
            </CsButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListingDetail;
