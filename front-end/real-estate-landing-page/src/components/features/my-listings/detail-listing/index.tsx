"use client";

import {
  useGetPropertyDetail,
  useUpdatePropertyStatus,
} from "@/components/features/my-listings/services/query";
import { normalizePropertyPrice } from "@/lib/property-price";
import { AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useCallback } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

// Sub-components
import { ListingHeader } from "./components/ListingHeader";
import { ListingMedia } from "./components/ListingMedia";
import { ListingStats } from "./components/ListingStats";
import { MarkAsSoldModal } from "./components/MarkAsSoldModal";
import { CelebrationModal } from "./components/CelebrationModal";

export const ListingDetail = () => {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;

  const { data, isLoading, refetch } = useGetPropertyDetail(propertyId);
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdatePropertyStatus();

  const [isSoldModalOpen, setIsSoldModalOpen] = useState(false);
  const [isCelebrationModalOpen, setIsCelebrationModalOpen] = useState(false);
  const [soldCustomerData, setSoldCustomerData] = useState({
    name: "",
    email: "",
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      soldPrice: "",
      soldTo: "",
      soldToEmail: "",
    },
    mode: "onChange",
  });

  const property = data?.data;

  const handleUpdateStatus = useCallback(
    (
      newStatus: "PUBLISHED" | "SOLD" | "EXPIRED",
      extraData?: { soldPrice?: string; soldTo?: string; soldToEmail?: string },
    ) => {
      updateStatus(
        { id: propertyId, status: newStatus, ...extraData },
        {
          onSuccess: () => {
            toast.success(`Property marked as ${newStatus.toLowerCase()}`);
            if (newStatus === "SOLD") {
              setIsSoldModalOpen(false);
              setIsCelebrationModalOpen(true);
              reset();
            }
            refetch();
          },
          onError: (err: any) => {
            toast.error(
              err?.response?.data?.message ||
                "Failed to update property status",
            );
          },
        },
      );
    },
    [propertyId, updateStatus, reset, refetch],
  );

  const handleConfirmSold = useCallback(
    (formData: any) => {
      setSoldCustomerData({
        name: formData.soldTo,
        email: formData.soldToEmail,
      });

      handleUpdateStatus("SOLD", {
        soldPrice: formData.soldPrice,
        soldTo: formData.soldTo,
        soldToEmail: formData.soldToEmail,
      });
    },
    [handleUpdateStatus],
  );

  const handleCloseCelebrationModal = useCallback(() => {
    setIsCelebrationModalOpen(false);
  }, []);

  const handleBack = useCallback(() => {
    router.push("/agent/listings");
  }, [router]);

  const handleEdit = useCallback(() => {
    router.push(`/agent/listings/edit/${propertyId}`);
  }, [router, propertyId]);

  const handleView = useCallback(() => {
    router.push(`/properties/${propertyId}`);
  }, [router, propertyId]);

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
          onClick={handleBack}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <ListingHeader
        property={property}
        isUpdating={isUpdating}
        onUpdateStatus={handleUpdateStatus}
        onOpenSoldModal={() => {
          reset({
            soldPrice: String(
              normalizePropertyPrice(
                property.features.price,
                property.features.priceUnit,
                property.features.area,
              ) ?? property.features.price,
            ),
            soldTo: "",
            soldToEmail: "",
          });
          setIsSoldModalOpen(true);
        }}
        onBack={handleBack}
        onEdit={handleEdit}
        onView={handleView}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ListingMedia property={property} />
        <ListingStats property={property} />
      </div>

      <MarkAsSoldModal
        isOpen={isSoldModalOpen}
        onOpenChange={setIsSoldModalOpen}
        handleSubmit={handleSubmit}
        handleConfirmSold={handleConfirmSold}
        control={control}
        errors={errors}
        reset={reset}
        isUpdating={isUpdating}
        currency={property.features.currency || "VND"}
        priceUnit={property.features.priceUnit}
      />

      <CelebrationModal
        isOpen={isCelebrationModalOpen}
        onClose={handleCloseCelebrationModal}
        customerData={soldCustomerData}
      />
    </div>
  );
};

export default ListingDetail;
