"use client";

import { CsStep } from "@/components/ui/stepper";
import { RootState } from "@/store";
import { setStep } from "@/store/listing.store";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { ListingFormData } from "../dto/listingformdata.dto";
import PropertyService from "../services/service";
import BasicInfo from "./components/BasicInfo";
import FeaturesPricing from "./components/FeaturesPricing";
import Location from "./components/Location";
import MediaContent from "./components/MediaContent";
import Review from "./components/Review";

const AddListing = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector(
    (state: RootState) => state.listing.currentStep,
  );
  const listingData = useSelector((state: RootState) => state.listing.data);

  const methods = useForm<ListingFormData>({
    defaultValues: {
      ...PropertyService.defaultFormValues,
      // Merge with any existing Redux data
      demandType:
        listingData.demandType || PropertyService.defaultFormValues.demandType,
      propertyType:
        listingData.propertyType ||
        PropertyService.defaultFormValues.propertyType,
      projectName:
        listingData.projectName ||
        PropertyService.defaultFormValues.projectName,
      province:
        listingData.location?.province ||
        PropertyService.defaultFormValues.province,

      ward:
        listingData.location?.ward || PropertyService.defaultFormValues.ward,
      address:
        listingData.location?.address ||
        PropertyService.defaultFormValues.address,
      latitude:
        listingData.location?.latitude ||
        PropertyService.defaultFormValues.latitude,
      longitude:
        listingData.location?.longitude ||
        PropertyService.defaultFormValues.longitude,
      area:
        listingData.features?.area || PropertyService.defaultFormValues.area,
      price:
        listingData.features?.price || PropertyService.defaultFormValues.price,
      bedrooms:
        listingData.features?.bedrooms ||
        PropertyService.defaultFormValues.bedrooms,
      bathrooms:
        listingData.features?.bathrooms ||
        PropertyService.defaultFormValues.bathrooms,
      direction:
        listingData.features?.direction ||
        PropertyService.defaultFormValues.direction,
      legalStatus:
        listingData.features?.legalStatus ||
        PropertyService.defaultFormValues.legalStatus,
      furniture:
        listingData.features?.furniture ||
        PropertyService.defaultFormValues.furniture,
      images:
        listingData.media?.images || PropertyService.defaultFormValues.images,
      thumbnail:
        listingData.media?.thumbnail ||
        PropertyService.defaultFormValues.thumbnail,
      videoLink:
        listingData.media?.videoLink ||
        PropertyService.defaultFormValues.videoLink,
      virtualTourUrls:
        listingData.media?.virtualTourUrls ||
        PropertyService.defaultFormValues.virtualTourUrls,
    },
    mode: "onChange",
  });

  const onFinalSubmit = (data: ListingFormData) => {
    console.log("Final submission:", data);
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
