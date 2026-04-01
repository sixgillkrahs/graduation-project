"use client";

import { useTranslations } from "next-intl";

const StatItem = ({ number, text }: { number: string; text: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <span className="text-3xl md:text-6xl! cs-typography font-black! text-[#000000]">
        {number}
      </span>
      <span className="cs-paragraph-gray text-sm! font-medium!">{text}</span>
    </div>
  );
};

const Stats = () => {
  const t = useTranslations("BecomeAgentPage.stats");

  return (
    <section className=" py-10 md:py-20 bg-black/10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 container mx-auto px-4">
        <StatItem
          number={t("items.activeAgents.number")}
          text={t("items.activeAgents.text")}
        />
        <StatItem
          number={t("items.commissions.number")}
          text={t("items.commissions.text")}
        />
        <StatItem
          number={t("items.support.number")}
          text={t("items.support.text")}
        />
      </div>
    </section>
  );
};

export default Stats;
