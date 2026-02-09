import { CsCard } from "@/components/custom/card";
import React from "react";

const WhyUs = () => {
  return (
    <section className="w-full h-full flex flex-col items-center justify-center px-4 md:px-20 py-10 md:py-20 container mx-auto">
      <h2 className="cs-typography text-2xl md:text-[40px]! font-bold! mb-4">
        Why Choose <span className="italic font-semibold">Havenly?</span>
      </h2>
      <span className="cs-paragraph-gray font-medium! max-w-[800px] text-center mb-10">
        Because we made renting as easy as it should be. No endless paperwork,
        no uncertainty, and thin the support of a team that's with you every
        step of the way
      </span>
      <div className="w-full md:h-auto lg:h-[300px] grid grid-cols-1 md:grid-cols-3 gap-4 rounded-[16px] ">
        <CsCard
          image="/icons/clock.svg"
          title="Everything In One Place"
          tag="Comfort"
        />
        <CsCard
          image="/icons/handshake.svg"
          title="We're With You Every Step Of The Way"
          tag="Trust"
        />
        <CsCard
          image="/icons/phone.svg"
          title="Stress-Free Renting Made Simple"
          tag="Simplicity"
        />
      </div>
    </section>
  );
};

export default WhyUs;
