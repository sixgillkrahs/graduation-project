import React from "react";

const HearCustom = () => {
  return (
    <section className="container p-4 md:p-20 mx-auto">
      <div className="cs-typography text-2xl md:text-[40px]! font-semibold! mb-4 mx-auto text-center">
        Hear From Our{" "}
        <span className="italic font-medium">Happy Customers</span>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {/* <div className="bg-[#ffffff] p-6 rounded-24">
          <div className="flex gap-4 items-center">
            <div className="cs-typography text-[24px]! font-semibold!">
              100% Satisfaction
            </div>
          </div>
          <div className="cs-paragraph-gray text-[16px]! mt-4">
            "I have been using Havenly for the last 2 years and I have never had
            to worry about my property. The team is always responsive and
            helpful."
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default HearCustom;
