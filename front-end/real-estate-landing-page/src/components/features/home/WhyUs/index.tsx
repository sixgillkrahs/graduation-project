"use client";

import { CsCard } from "@/components/custom/card";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const WhyUs = () => {
  const t = useTranslations("WhyUs");

  const cards = [
    { image: "/icons/clock.svg", title: t("card1Title"), tag: t("card1Tag") },
    {
      image: "/icons/handshake.svg",
      title: t("card2Title"),
      tag: t("card2Tag"),
    },
    { image: "/icons/phone.svg", title: t("card3Title"), tag: t("card3Tag") },
  ];

  return (
    <section className="w-full h-full flex flex-col items-center justify-center px-4 md:px-20 py-10 md:py-20 container mx-auto overflow-hidden">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="cs-typography text-2xl md:text-[40px]! font-bold! mb-4"
      >
        {t("title")}{" "}
        <span className="italic font-semibold">{t("brandName")}</span>
      </motion.h2>
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="cs-paragraph-gray font-medium! max-w-[800px] text-center mb-10"
      >
        {t("description")}
      </motion.span>
      <div className="w-full md:h-auto lg:h-[300px] grid grid-cols-1 md:grid-cols-3 gap-4 rounded-[16px] ">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            className="h-full w-full"
          >
            <CsCard image={card.image} title={card.title} tag={card.tag} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WhyUs;
