"use client";

import { CsStep } from "@/components/ui/stepper";
import { RootState } from "@/store";
import { setStep, updateListingData } from "@/store/listing.store";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { ListingFormData } from "../dto/listingformdata.dto";
import { useGetPropertyDetail } from "../services/query";
import PropertyService from "../services/service";
import BasicInfo from "./components/BasicInfo";
import FeaturesPricing from "./components/FeaturesPricing";
import Location from "./components/Location";
import MediaContent from "./components/MediaContent";
import Review from "./components/Review";

const EditListing = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector(
    (state: RootState) => state.listing.currentStep,
  );
  const [isReady, setIsReady] = useState(false);
  const params = useParams();
  const propertyId = params.id as string;

  // Fetch property details
  const { data: propertyResponse, isLoading } =
    useGetPropertyDetail(propertyId);

  const methods = useForm<ListingFormData>({
    defaultValues: PropertyService.defaultFormValues,
    mode: "onChange",
  });

  // Pre-populate Form and Redux Store when data implies
  useEffect(() => {
    if (propertyResponse?.data) {
      const p = propertyResponse.data;

      const hydratedData = {
        demandType: p.demandType,
        propertyType: p.propertyType,
        projectName: p.projectName || "",
        title: p.title || "",
        description: p.description || "",
        province: p.location?.province || "",
        ward: p.location?.ward || "",
        address: p.location?.address || "",
        latitude: p.location?.coordinates?.lat || null,
        longitude: p.location?.coordinates?.long || null,
        area: p.features?.area || "",
        price: p.features?.price || "",
        bedrooms: p.features?.bedrooms || 1,
        bathrooms: p.features?.bathrooms || 1,
        direction: p.features?.direction || "",
        legalStatus: p.features?.legalStatus || "",
        furniture: p.features?.furniture || "",
        images: p.media?.images || [],
        thumbnail: p.media?.thumbnail || "",
        videoLink: p.media?.videoLink || "",
        virtualTourUrls: p.media?.virtualTourUrls || [],
      } as Partial<ListingFormData>;

      // Hydrate via RHF reset
      methods.reset(hydratedData as ListingFormData);

      // Sync into Redux
      // Map to Redux structure (which has location/features/media objects)
      dispatch(
        updateListingData({
          demandType: p.demandType,
          propertyType: p.propertyType,
          projectName: p.projectName,
          title: p.title,
          description: p.description,
          location: {
            province: hydratedData.province,
            ward: hydratedData.ward,
            address: hydratedData.address,
            latitude: hydratedData.latitude,
            longitude: hydratedData.longitude,
          },
          features: {
            area: hydratedData.area,
            price: hydratedData.price,
            bedrooms: hydratedData.bedrooms,
            bathrooms: hydratedData.bathrooms,
            direction: hydratedData.direction,
            legalStatus: hydratedData.legalStatus,
            furniture: hydratedData.furniture,
          },
          media: {
            images: hydratedData.images,
            thumbnail: hydratedData.thumbnail,
            videoLink: hydratedData.videoLink,
            virtualTourUrls: hydratedData.virtualTourUrls,
          },
        } as any),
      );

      dispatch(setStep(0)); // Start from beginning
      setIsReady(true);
    }
  }, [propertyResponse, methods, dispatch]);

  const onFinalSubmit = (data: ListingFormData) => {
    console.log("Final submission:", data);
  };

  const steps = [
    { title: "Basic Info", content: <BasicInfo /> },
    { title: "Location", content: <Location /> },
    { title: "Features & Pricing", content: <FeaturesPricing /> },
    { title: "Media", content: <MediaContent /> },
    { title: "Review", content: <Review propertyId={propertyId} /> },
  ];

  if (isLoading || !isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Loading property details...</p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFinalSubmit)}>
        <div className="max-w-7xl mx-auto p-8 pb-24">
          <CsStep
            steps={steps}
            currentStep={currentStep + 1}
            onStepChange={(step) => dispatch(setStep(step - 1))}
            showNavigation={false}
          />
        </div>
      </form>
    </FormProvider>
  );
};

export default EditListing;
