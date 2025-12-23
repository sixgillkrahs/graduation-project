"use client";

import { Button, Icon } from "@/components/ui";
import { AppDispatch, RootState } from "@/store";
import { nextStep, prevStep } from "@/store/store";
import { submitForm } from "@/store/thunks/formThunks";
import { useDispatch, useSelector } from "react-redux";
import BasicInfo from "./components/BasicInfo";
import BusinessInfo from "./components/BusinessInfo";
import Verification from "./components/Verification";

const steps = [
  {
    title: "Personal Information",
    description: "We need your basic details to create your agent profile",
    component: <BasicInfo />,
  },
  {
    title: "Business Information",
    description: "We need your business details to create your agent profile",
    component: <BusinessInfo />,
  },
  {
    title: "Verification",
    description: "We need to verify your identity to create your agent profile",
    component: <Verification />,
  },
];

const Recruitment = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentStep, isSubmitting, submitError } = useSelector(
    (state: RootState) => state.form
  );

  const handleNext = () => {
    dispatch(nextStep());
  };

  const handlePrev = () => {
    dispatch(prevStep());
  };

  const handleSubmit = async () => {
    try {
      await dispatch(submitForm()).unwrap();
      console.log("Form submitted successfully!");
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };

  return (
    <section className="relative bg-black/10 py-10">
      <div className="px-20 container mx-auto flex flex-col gap-6">
        <div className="text-center">
          <div className="cs-typography font-black! text-4xl! mb-2">
            Agent Application
          </div>
          <div className="cs-typography-gray text-base! max-w-lg mx-auto font-medium!">
            Complete your profile to join the fastest-growing AI real estate
            network
          </div>
        </div>
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-auto max-w-[700px]">
            {submitError}
          </div>
        )}
        <div className="absolute top-4 right-10 flex items-center justify-center gap-4">
          <div className="grid text-right">
            <span className="cs-paragraph text-lg!">APPLICATION STATUS</span>
            <span className="cs-paragraph-gray text-sm! font-bold!">
              Step {currentStep + 1} of {steps.length}:{" "}
              {steps[currentStep].title}
            </span>
          </div>

          <div className="w-[120px] h-2 bg-gray-300 rounded-full relative">
            <div
              className={`h-2 bg-amber-300 rounded-full absolute top-0 left-0`}
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="max-w-[700px] w-full h-auto bg-white rounded-3xl shadow-20 px-10 pt-10 pb-4! mx-auto">
          <div className="inline-flex items-center justify-center gap-4">
            <div className="cs-bg-gray p-3 rounded-full w-10 h-10 flex items-center justify-center text-white">
              {currentStep + 1}
            </div>
            <div className="grid">
              <div className="cs-typography font-black! text-2xl!">
                {steps[currentStep].title}
              </div>
              <div className="cs-paragraph-gray text-sm! font-medium!">
                {steps[currentStep].description}
              </div>
            </div>
          </div>
          <div className="w-full h-[1px] bg-black/10 my-3" />
          {steps.map((step, index) => (
            <div
              key={index}
              style={{ display: currentStep === index ? "block" : "none" }}
            >
              {step.component}
            </div>
          ))}
          <div className="flex justify-between pt-6">
            <div>
              {currentStep !== 0 && (
                <Button
                  className="text-black px-6 py-2 rounded-full"
                  onClick={handlePrev}
                  icon={<Icon.ArrowLeft className="w-5 h-5" />}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}
            </div>

            {currentStep !== steps.length - 1 ? (
              <Button
                className="cs-bg-black text-white px-6 py-2 rounded-full"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button
                className="cs-bg-black text-white px-6 py-2 rounded-full"
                onClick={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Recruitment;
