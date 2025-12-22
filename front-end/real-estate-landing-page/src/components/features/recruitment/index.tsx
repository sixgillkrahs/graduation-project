import React from "react";

const Recruitment = () => {
  return (
    <section className="container mx-auto px-20 py-15 flex flex-col items-center justify-center gap-10 relative bg-black/10">
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
            Step 1 of 3: Personal Information
          </span>
        </div>

        <div className="w-[120px] h-2 bg-gray-300 rounded-full relative">
          <div className="w-1/3 h-2 bg-amber-300 rounded-full absolute top-0 left-0" />
        </div>
      </div>
      <div className="max-w-[600px] w-full h-[400px] bg-white rounded-3xl shadow-20 p-10">
        <div className="inline-flex items-center justify-center gap-4">
          <div className="cs-bg-gray p-3 rounded-full w-10 h-10 flex items-center justify-center text-white">
            1
          </div>
          <div className="grid">
            <div className="cs-typography font-black! text-2xl!">
              Personal Information
            </div>
            <div className="cs-paragraph-gray text-sm! font-medium!">
              We need your basic details to create your agent profile
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Recruitment;
