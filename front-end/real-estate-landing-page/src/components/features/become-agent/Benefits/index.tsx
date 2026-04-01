"use client";

import { Icon } from "@/components/ui";
import { ReactNode } from "react";
import { useTranslations } from "next-intl";

const Card = ({
  icon,
  description,
  title,
  main,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  main?: boolean;
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition hover:shadow-xl hover:-translate-y-1">
    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-primary group-hover:bg-primary group-hover:text-[#FF5C56] transition-colors">
      <span className=" text-3xl">{icon}</span>
    </div>
    <h3 className="mb-3 text-xl! font-bold! cs-typography">{title}</h3>
    <p className="cs-paragraph-gray text-base! leading-relaxed">
      {description}
    </p>
  </div>
);

const Benefit = () => {
  const t = useTranslations("BecomeAgentPage.benefits");

  return (
    <section className="container mx-auto px-4 md:px-20 py-10 md:py-30">
      <div className="text-center">
        <div className="cs-typography font-black! text-2xl md:text-4xl! mb-2">
          {t("title")}
        </div>
        <div className="cs-typography-gray text-base! max-w-lg mx-auto font-medium!">
          {t("description")}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10 md:mt-20">
        <Card
          icon={<Icon.HeadGear />}
          title={t("items.leads.title")}
          description={t("items.leads.description")}
        />
        <Card
          icon={<Icon.BarChatBox />}
          title={t("items.insights.title")}
          description={t("items.insights.description")}
        />
        <Card
          icon={<Icon.Safe2 />}
          title={t("items.commission.title")}
          description={t("items.commission.description")}
        />
      </div>
    </section>
  );
};

export default Benefit;
