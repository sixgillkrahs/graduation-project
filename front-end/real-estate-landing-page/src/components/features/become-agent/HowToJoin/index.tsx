"use client";

import { Icon } from "@/components/ui";
import React from "react";
import { useTranslations } from "next-intl";

const Step = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="rounded-full bg-white flex items-center justify-center p-1 shadow-2xl">
        <div className="rounded-full bg-black/10 flex items-center justify-center p-6">
          {icon}
        </div>
      </div>
      <div className="cs-typography font-black! text-2xl! mb-2">{title}</div>
      <div className="cs-typography-gray text-base!  mx-auto font-medium! max-w-2xs">
        {description}
      </div>
    </div>
  );
};

const HowToJoin = () => {
  const t = useTranslations("BecomeAgentPage.howToJoin");

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mt-10 md:mt-20">
        <Step
          icon={<Icon.AddUser className="size-8 main-color-red" />}
          title={t("steps.account.title")}
          description={t("steps.account.description")}
        />
        <Step
          icon={<Icon.ShieldCheck className="size-8 main-color-red" />}
          title={t("steps.verify.title")}
          description={t("steps.verify.description")}
        />
        <Step
          icon={<Icon.Rocket2 className="size-8 main-color-red" />}
          title={t("steps.start.title")}
          description={t("steps.start.description")}
        />
      </div>
    </section>
  );
};

export default HowToJoin;
