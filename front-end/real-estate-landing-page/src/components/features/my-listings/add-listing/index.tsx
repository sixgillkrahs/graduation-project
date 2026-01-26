"use client";

import { Steps } from "@/components/ui";
import { RootState } from "@/store";
import { setStep } from "@/store/listing.store";
import { useDispatch, useSelector } from "react-redux";
import BasicInfo from "./components/BasicInfo";
import Location from "./components/Location";
import { CsStep } from "@/components/ui/stepper";

const AddListing = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector(
    (state: RootState) => state.listing.currentStep,
  );

  const steps = [
    { title: "Basic Info", content: <BasicInfo /> },
    { title: "Location", content: <Location /> },
    { title: "Features", content: <div>Features Content</div> },
    { title: "Media", content: <div>Media Content</div> },
    { title: "Review", content: <div>Review Content</div> },
  ];

  // Steps 0 and 1 have their own navigation buttons
  const showNav = currentStep > 1;

  return (
    <div className="max-w-5xl mx-auto p-8 pb-24">
      <CsStep
        steps={steps}
        currentStep={currentStep + 1}
        onStepChange={(step) => dispatch(setStep(step - 1))}
        showNavigation={showNav}
      />
    </div>
  );
};

export default AddListing;
