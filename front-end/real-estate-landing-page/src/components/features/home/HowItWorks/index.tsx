"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Search, CalendarDays, KeyRound } from "lucide-react";
import { motion } from "framer-motion";

const HowItWorks = () => {
  const t = useTranslations("HowItWorks");

  const steps = [
    {
      id: 1,
      icon: <Search className="w-8 h-8 text-black" />,
      title: t("step1Title"),
      desc: t("step1Desc"),
    },
    {
      id: 2,
      icon: <CalendarDays className="w-8 h-8 text-black" />,
      title: t("step2Title"),
      desc: t("step2Desc"),
    },
    {
      id: 3,
      icon: <KeyRound className="w-8 h-8 text-black" />,
      title: t("step3Title"),
      desc: t("step3Desc"),
    },
  ];

  return (
    <section className="container p-4 md:p-20 mx-auto">
      <div className="cs-typography text-2xl md:text-[40px]! font-semibold! mb-12 mx-auto text-center">
        {t("title")}{" "}
        <span className="italic font-medium">{t("titleItalic")}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Hidden connecting line for desktop */}
        <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-black/10 -z-10" />

        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="flex flex-col items-center text-center gap-4 bg-white/50 p-6 rounded-3xl"
          >
            <div className="w-24 h-24 rounded-full bg-black/5 flex items-center justify-center shrink-0 mb-4 outline-8 outline-white/80">
              {step.icon}
            </div>
            <h3 className="cs-typography font-black! text-xl!">{step.title}</h3>
            <p className="cs-paragraph-gray text-base max-w-sm">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
