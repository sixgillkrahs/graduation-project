"use client";

import { Icon } from "@/components/ui";
import { RootState } from "@/store";
import Link from "next/link";
import { useSelector } from "react-redux";
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
    description: "Verify your identity to create your agent profile",
    component: <Verification />,
  },
];

const Recruitment = () => {
  const { currentStep, isSubmitSuccess } = useSelector(
    (state: RootState) => state.form,
  );

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
          {isSubmitSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-500">
              <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20 duration-1000"></div>
                <div className="relative w-24 h-24 bg-green-50 rounded-full flex items-center justify-center border border-green-100 shadow-sm">
                  <Icon.CheckMark className="w-10 h-10 text-emerald-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                Application Successful!
              </h2>

              <div className="max-w-md mx-auto space-y-2 text-gray-500 mb-8">
                <p>
                  Thank you for applying to become an agent. We have received
                  your information and will review it.
                </p>
                <p className="text-sm">
                  The results will be sent to your email within{" "}
                  <span className="font-medium text-gray-900">24-48 hours</span>{" "}
                  working hours.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  // onClick={onReset}
                  className="
            px-8 py-3 rounded-full 
            bg-black text-white font-medium text-sm
            hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl
            active:scale-95
          "
                >
                  Apply for Another Agent
                </button>

                <Link
                  href="/"
                  className="
            px-8 py-3 rounded-full 
            border border-gray-200 text-gray-600 font-medium text-sm
            hover:bg-gray-50 hover:text-black transition-all
            flex items-center justify-center
          "
                >
                  Go to Home Page
                </Link>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Recruitment;
