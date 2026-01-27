"use client";

import { Steps } from "@/components/ui";
import { RootState } from "@/store";
import { setStep } from "@/store/listing.store";
import { useDispatch, useSelector } from "react-redux";
import BasicInfo from "./components/BasicInfo";
import Location from "./components/Location";
import { CsStep } from "@/components/ui/stepper";
import FeaturesPricing from "./components/FeaturesPricing";
import MediaContent from "./components/MediaContent";

const AddListing = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector(
    (state: RootState) => state.listing.currentStep,
  );

  const steps = [
    { title: "Basic Info", content: <BasicInfo /> },
    { title: "Location", content: <Location /> },
    { title: "Features & Pricing", content: <FeaturesPricing /> },
    { title: "Media", content: <MediaContent /> },
    { title: "Review", content: <div>Review Content</div> },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 pb-24">
      <CsStep
        steps={steps}
        currentStep={currentStep + 1}
        onStepChange={(step) => dispatch(setStep(step - 1))}
        showNavigation={false}
      />
    </div>
  );
};

export default AddListing;
