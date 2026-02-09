"use client";

import { CsButton } from "@/components/custom";
import Properties from "./components/Properties";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const FeaturedProperties = () => {
  const t = useTranslations("HomePage");
  const router = useRouter();

  const handleViewAllProperties = () => {
    router.push("/properties");
  };

  return (
    <section className="px-4 md:px-20 container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-col mb-4 md:mb-0">
          <span className="cs-typography text-2xl md:text-[40px]! font-semibold! mb-3">
            Featured <span className="italic font-normal">Properties</span>
          </span>
          <span className="cs-paragraph-gray max-w-[800px] text-center md:text-left text-[16px]!">
            Discover our hand-picked selection of premium rentals.
          </span>
        </div>
        <CsButton
          className="text-white cs-bg-black rounded-full"
          onClick={handleViewAllProperties}
        >
          View All Properties
        </CsButton>
      </div>
      <div className="h-px w-full bg-[#E5E5E5] my-6" />
      <Properties />
    </section>
  );
};

export default FeaturedProperties;
