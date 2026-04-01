"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui";

const Review = () => {
  const t = useTranslations("BecomeAgentPage.review");

  return (
    <section className=" px-4 md:px-20 py-10 md:py-30 bg-black/10 grid grid-cols-1 gap-4">
      <div className="flex gap-1 justify-center container mx-auto">
        <Icon.Star className="size-5 text-yellow-500" />
        <Icon.Star className="size-5 text-yellow-500" />
        <Icon.Star className="size-5 text-yellow-500" />
        <Icon.Star className="size-5 text-yellow-500" />
        <Icon.Star className="size-5 text-yellow-500" />
      </div>
      <div className="text-center text-lg md:text-xl! font-medium! text-black max-w-xl mx-auto px-4">
        {t("quote")}
      </div>
      <div className="flex justify-center gap-2">
        <div className="flex items-center justify-center gap-1 text-base md:text-[18px]!">
          <Icon.User className="size-7 text-black " />
        </div>
        <div>
          <div className="text-black font-medium! text-base md:text-[18px]!">
            {t("author")}
          </div>
          <div className="cs-paragraph-gray text-sm! font-medium!">
            {t("role")}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Review;
