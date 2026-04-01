"use client";

import { CsButton } from "@/components/custom";
import { ROUTES } from "@/const/routes";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const CTA = () => {
  const t = useTranslations("BecomeAgentPage.cta");
  const router = useRouter();

  return (
    <section className="container mx-auto px-4 md:px-20 py-10 md:py-30 flex flex-col items-center justify-center gap-4">
      <div className="text-center">
        <div className="cs-typography font-black! text-2xl md:text-4xl! mb-2">
          {t("title")}
        </div>
        <div className="cs-typography-gray text-base! max-w-lg mx-auto font-medium!">
          {t("description")}
        </div>
      </div>
      <CsButton
        className="cs-bg-black text-white"
        onClick={() => router.push(ROUTES.RECRUITMENT)}
      >
        {t("button")}
      </CsButton>
    </section>
  );
};

export default CTA;
