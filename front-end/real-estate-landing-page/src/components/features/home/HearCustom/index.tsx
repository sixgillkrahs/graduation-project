"use client";

import { useTranslations } from "next-intl";

const HearCustom = () => {
  const t = useTranslations("HearCustom");

  return (
    <section className="container p-4 md:p-20 mx-auto">
      <div className="cs-typography text-2xl md:text-[40px]! font-semibold! mb-4 mx-auto text-center">
        {t("titleNormal")}{" "}
        <span className="italic font-medium">{t("titleItalic")}</span>
      </div>
      <div className="grid grid-cols-1 gap-6"></div>
    </section>
  );
};

export default HearCustom;
