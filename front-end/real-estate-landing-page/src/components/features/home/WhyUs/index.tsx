"use client";

import { CsCard } from "@/components/custom/card";
import { useTranslations } from "next-intl";

const WhyUs = () => {
  const t = useTranslations("WhyUs");

  return (
    <section className="w-full h-full flex flex-col items-center justify-center px-4 md:px-20 py-10 md:py-20 container mx-auto">
      <h2 className="cs-typography text-2xl md:text-[40px]! font-bold! mb-4">
        {t("title")}{" "}
        <span className="italic font-semibold">{t("brandName")}</span>
      </h2>
      <span className="cs-paragraph-gray font-medium! max-w-[800px] text-center mb-10">
        {t("description")}
      </span>
      <div className="w-full md:h-auto lg:h-[300px] grid grid-cols-1 md:grid-cols-3 gap-4 rounded-[16px] ">
        <CsCard
          image="/icons/clock.svg"
          title={t("card1Title")}
          tag={t("card1Tag")}
        />
        <CsCard
          image="/icons/handshake.svg"
          title={t("card2Title")}
          tag={t("card2Tag")}
        />
        <CsCard
          image="/icons/phone.svg"
          title={t("card3Title")}
          tag={t("card3Tag")}
        />
      </div>
    </section>
  );
};

export default WhyUs;
