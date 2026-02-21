"use client";

import { CsButton } from "@/components/custom";
import { Icon } from "@/components/ui";
import { useTranslations } from "next-intl";

const BenefitItem = ({ title }: { title: string }) => {
  return (
    <div className="flex items-center gap-2">
      <Icon.CheckMark className="main-color-red" />
      <span className="cs-typography text-[16px]! font-medium!">{title}</span>
    </div>
  );
};

const Benefit = () => {
  const t = useTranslations("Benefit");

  const benefitItems = [
    t("item1"),
    t("item2"),
    t("item3"),
    t("item4"),
    t("item5"),
  ];

  const BenefitCard = () => (
    <div className="relative w-full md:w-5/12 bg-white rounded-2xl p-4 md:p-8 overflow-hidden">
      <div
        className="absolute -top-[20px] -right-[20px] size-30 
           border-4 border-black/10 
           rounded-bl-[100%]"
      />

      <div className="max-w-[400px] relative z-10 mb-6">
        <span className="cs-typography text-2xl md:text-4xl! font-medium!">
          {t("titleNormal")}{" "}
        </span>
        <span className="cs-typography text-2xl md:text-4xl! italic!">
          {t("titleItalic")}
        </span>
      </div>

      <div className="p-4 md:p-6 outline outline-1 outline-black/10 rounded-2xl flex flex-col gap-4 relative z-10">
        {benefitItems.map((item, index) => (
          <BenefitItem key={index} title={item} />
        ))}
        <div className="mt-4">
          <CsButton className="cs-bg-black text-white">
            {t("listMyProperty")}
          </CsButton>
        </div>
      </div>
    </div>
  );

  return (
    <section className="bg-black/10 py-10 md:py-30">
      <div className="px-4 md:px-20 container mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          <div className="w-full md:w-7/12">
            <img
              src="https://placehold.co/600x300"
              alt="100% Satisfaction Guarantee"
              className="rounded-2xl w-full h-full object-cover"
            />
          </div>
          <BenefitCard />
        </div>
        <div className="flex flex-col md:flex-row-reverse gap-6 items-stretch">
          <div className="w-full md:w-7/12">
            <img
              src="https://placehold.co/600x300"
              alt="100% Satisfaction Guarantee"
              className="rounded-2xl w-full h-full object-cover"
            />
          </div>
          <BenefitCard />
        </div>
      </div>
    </section>
  );
};

export default Benefit;
