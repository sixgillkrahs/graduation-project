"use client";

import { CsButton } from "@/components/custom";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/const/routes";
import { motion } from "framer-motion";

const FinalCTA = () => {
  const t = useTranslations("FinalCTA");
  const router = useRouter();

  return (
    <section className="container p-4 md:p-20 mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-black/90 text-white rounded-[2rem] p-10 md:p-20 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl"
      >
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <h2 className="text-3xl md:text-5xl font-semibold mb-6 z-10">
          {t("title")}{" "}
          <span className="italic font-normal shrink-0">
            {t("titleItalic")}
          </span>
        </h2>

        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-10 z-10">
          {t("description")}
        </p>

        <CsButton
          onClick={() => router.push(ROUTES.PROPERTIES)}
          className="bg-white! text-black hover:bg-gray-100 rounded-full py-6 px-10 text-lg font-semibold transition-transform hover:scale-105 active:scale-95 z-10"
        >
          {t("button")}
        </CsButton>
      </motion.div>
    </section>
  );
};

export default FinalCTA;
