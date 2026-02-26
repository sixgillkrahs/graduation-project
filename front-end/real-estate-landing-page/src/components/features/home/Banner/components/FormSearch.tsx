"use client";

import { CsButton } from "@/components/custom";
import { Slider, Tabs, Tag } from "@/components/ui";
import { CsSelect } from "@/components/ui/select";
import { memo } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/const/routes";
import LocationAutocomplete from "@/components/features/properties/components/LocationAutocomplete";
import { motion } from "framer-motion";

interface BannerSearchValues {
  query: string;
  demandType: string;
  propertyType: string;
  maxPrice: number;
  bedrooms: string;
}

const FormSearch = () => {
  const t = useTranslations("Banner");
  const router = useRouter();

  const optionsType = [
    { label: t("apartment"), value: "APARTMENT" },
    { label: t("house"), value: "HOUSE" },
  ];

  const optionsBedrooms = [
    { label: t("bedroom1"), value: "1" },
    { label: t("bedroom2"), value: "2" },
    { label: t("bedroom3"), value: "3" },
    { label: t("bedroom4"), value: "4" },
  ];

  const { control, handleSubmit, setValue, watch } =
    useForm<BannerSearchValues>({
      defaultValues: {
        query: "",
        demandType: "RENT",
        propertyType: "",
        maxPrice: 20,
        bedrooms: "",
      },
    });

  const demandType = watch("demandType");

  const onSubmit = (data: BannerSearchValues) => {
    const params = new URLSearchParams();
    if (data.demandType) params.append("demandType", data.demandType);
    if (data.propertyType) params.append("propertyType", data.propertyType);
    if (data.maxPrice < 20) params.append("maxPrice", data.maxPrice.toString());
    if (data.query) params.append("query", data.query);
    // Optionally keep bedrooms if the backend ever supports it, but AdvancedSearch doesn't use it yet

    router.push(`${ROUTES.PROPERTIES}?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      className="absolute bottom-4 left-4 right-4 md:bottom-2 md:right-20 md:left-auto z-10 max-w-sm md:max-w-md bg-white/90 backdrop-blur-md p-4 md:p-7 rounded-xl shadow-lg"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-black leading-tight mb-4">
        {t("title")}
      </h2>
      <Tabs
        fullWidth
        current={demandType === "RENT" ? 0 : 1}
        onChange={(index) =>
          setValue("demandType", index === 0 ? "RENT" : "SALE")
        }
        items={[{ title: t("rent") }, { title: t("sell") }]}
      />
      <div className="h-px bg-black/10 my-4"></div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <Controller
          name="query"
          control={control}
          render={({ field }) => (
            <LocationAutocomplete
              value={field.value}
              onChange={field.onChange}
              placeholder={t("enterLocation")}
            />
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="propertyType"
            control={control}
            render={({ field }) => (
              <CsSelect
                placeholder={t("propertyType")}
                options={optionsType}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="bedrooms"
            control={control}
            render={({ field }) => (
              <CsSelect
                placeholder={t("bedrooms")}
                options={optionsBedrooms}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <Controller
          name="maxPrice"
          control={control}
          render={({ field }) => (
            <Slider
              min={0}
              max={20}
              step={0.5}
              currentValue={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <CsButton type="submit" className="cs-bg-black text-white">
          {t("search")}
        </CsButton>
      </form>
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
    </motion.div>
  );
};

export default memo(FormSearch);
