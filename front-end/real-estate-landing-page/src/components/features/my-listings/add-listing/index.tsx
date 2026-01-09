"use client";

import { Steps } from "@/components/ui";
import { RootState } from "@/store";
import { setStep } from "@/store/listing.store";
import { useDispatch, useSelector } from "react-redux";
import BasicInfo from "./components/BasicInfo";
import Location from "./components/Location";

const AddListing = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector(
    (state: RootState) => state.listing.currentStep
  );

  return (
    <div className="max-w-5xl mx-auto p-8 pb-24">
      <Steps
        current={currentStep}
        items={[
          { title: "Basic Info" },
          { title: "Location" },
          { title: "Features" },
          { title: "Media" },
          { title: "Review" },
        ]}
        onChange={(step) => dispatch(setStep(step))}
      />
      <div className="mt-8">
        {currentStep === 0 && <BasicInfo />}
        {currentStep === 1 && <Location />}
        {/* {currentStep === 2 && <Step3 />} */}
      </div>
    </div>
  );
};

export default AddListing;
