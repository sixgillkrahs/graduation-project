"use client";

import { CsButton } from "@/components/custom";
import { Icon, Slider, Tabs, Tag } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { CsSelect } from "@/components/ui/select";
import { memo } from "react";
import { useTranslations } from "next-intl";

const FormSearch = () => {
  const t = useTranslations("Banner");

  const optionsType = [
    { label: t("apartment"), value: "partment" },
    { label: t("house"), value: "house" },
  ];

  const optionsBedrooms = [
    { label: t("bedroom1"), value: "1" },
    { label: t("bedroom2"), value: "2" },
    { label: t("bedroom3"), value: "3" },
    { label: t("bedroom4"), value: "4" },
  ];

  return (
    <div className="absolute bottom-4 left-4 right-4 md:bottom-2 md:right-20 md:left-auto z-10 max-w-sm md:max-w-md bg-white/90 backdrop-blur-md p-4 md:p-7 rounded-xl shadow-lg">
      <h2 className="text-2xl md:text-3xl font-bold text-black leading-tight mb-4">
        {t("title")}
      </h2>
      <Tabs fullWidth items={[{ title: t("rent") }, { title: t("sell") }]} />
      <div className="h-px bg-black/10 my-4"></div>
      <div className="flex flex-col gap-3">
        <Input
          label=""
          placeholder={t("enterLocation")}
          preIcon={<Icon.MapPin className="w-5 h-5 text-black" />}
        />
        <div className="grid grid-cols-2 gap-3">
          <CsSelect placeholder={t("propertyType")} options={optionsType} />
          <CsSelect placeholder={t("bedrooms")} options={optionsBedrooms} />
        </div>
        <Slider min={0} max={10000} step={1000} />
        <CsButton className="cs-bg-black text-white">{t("search")}</CsButton>
      </div>
      <div className="h-px bg-black/10 my-4"></div>
      <div className="flex  flex-col items-center gap-2">
        <span className="cs-paragraph-gray text-[16px]!">
          {t("popularSearches")}
        </span>
        <div className="flex gap-2 flex-wrap justify-center">
          <Tag title={t("petFriendly")} />
          <Tag title={t("house")} />
          <Tag title={t("pool")} />
        </div>
      </div>
    </div>
  );
};

export default memo(FormSearch);
