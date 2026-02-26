"use client";

import { CsButton } from "@/components/custom";
import { ROUTES } from "@/const/routes";
import Properties from "./components/Properties";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const FeaturedProperties = () => {
  const t = useTranslations("FeaturedProperties");
  const router = useRouter();

  const handleViewAllProperties = () => {
    router.push(ROUTES.PROPERTIES);
  };

  return (
    <section className="px-4 md:px-20 container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-center"
      >
        <div className="flex flex-col mb-4 md:mb-0">
          <span className="cs-typography text-2xl md:text-[40px]! font-semibold! mb-3">
            {t("title")}{" "}
            <span className="italic font-normal">{t("titleItalic")}</span>
          </span>
          <span className="cs-paragraph-gray max-w-[800px] text-center md:text-left text-[16px]!">
            {t("description")}
          </span>
        </div>
        <CsButton
          className="text-white cs-bg-black rounded-full"
          onClick={handleViewAllProperties}
        >
          {t("viewAll")}
        </CsButton>
      </motion.div>
      <div className="h-px w-full bg-[#E5E5E5] my-6" />
      <Properties />
    </section>
  );
};

export default FeaturedProperties;
