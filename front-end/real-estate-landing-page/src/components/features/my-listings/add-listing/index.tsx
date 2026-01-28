"use client";

import { CsStep } from "@/components/ui/stepper";
import { RootState } from "@/store";
import { setStep } from "@/store/listing.store";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import BasicInfo from "./components/BasicInfo";
import FeaturesPricing from "./components/FeaturesPricing";
import Location from "./components/Location";
import MediaContent from "./components/MediaContent";
import Review from "./components/Review";
import { defaultFormValues, ListingFormData } from "./types";

const AddListing = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector(
    (state: RootState) => state.listing.currentStep,
  );
  const listingData = useSelector((state: RootState) => state.listing.data);

  const methods = useForm<ListingFormData>({
    defaultValues: {
      ...defaultFormValues,
      // Merge with any existing Redux data
      demandType: listingData.demandType || defaultFormValues.demandType,
      propertyType: listingData.propertyType || defaultFormValues.propertyType,
      projectName: listingData.projectName || defaultFormValues.projectName,
      province: listingData.location?.province || defaultFormValues.province,

      ward: listingData.location?.ward || defaultFormValues.ward,
      address: listingData.location?.address || defaultFormValues.address,
      latitude: listingData.location?.latitude || defaultFormValues.latitude,
      longitude: listingData.location?.longitude || defaultFormValues.longitude,
      area: listingData.features?.area || defaultFormValues.area,
      price: listingData.features?.price || defaultFormValues.price,
      bedrooms: listingData.features?.bedrooms || defaultFormValues.bedrooms,
      bathrooms: listingData.features?.bathrooms || defaultFormValues.bathrooms,
      direction: listingData.features?.direction || defaultFormValues.direction,
      legalStatus:
        listingData.features?.legalStatus || defaultFormValues.legalStatus,
      furniture: listingData.features?.furniture || defaultFormValues.furniture,
      images: listingData.media?.images || defaultFormValues.images,
    },
    mode: "onChange",
  });

  const onFinalSubmit = (data: ListingFormData) => {
    console.log("Final submission:", data);
    // TODO: Call API to submit listing
  };

  const steps = [
    { title: "Basic Info", content: <BasicInfo /> },
    { title: "Location", content: <Location /> },
    { title: "Features & Pricing", content: <FeaturesPricing /> },
    { title: "Media", content: <MediaContent /> },
    { title: "Review", content: <Review /> },
  ];

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

export default AddListing;
