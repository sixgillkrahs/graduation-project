"use client";

import { Slider } from "@/components/ui";
import { useLocale, useTranslations } from "next-intl";

const YEARLY_INCOME_USD = 144_000;
const AVG_HOME_PRICE_USD = 400_000;
const USD_TO_VND_RATE = 25_500;

const Earnings = () => {
  const locale = useLocale();
  const t = useTranslations("BecomeAgentPage.earnings");
  const isVietnamese = locale.toLowerCase().startsWith("vi");
  const currency = isVietnamese ? "VND" : "USD";
  const localeTag = isVietnamese ? "vi-VN" : "en-US";
  const yearlyIncome = isVietnamese
    ? YEARLY_INCOME_USD * USD_TO_VND_RATE
    : YEARLY_INCOME_USD;
  const averageHomePrice = isVietnamese
    ? AVG_HOME_PRICE_USD * USD_TO_VND_RATE
    : AVG_HOME_PRICE_USD;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(localeTag, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <section className=" bg-black/10 py-10 md:py-20">
      <div className="max-w-4xl mx-auto relative overflow-hidden container mx-auto px-4">
        <div
          className="absolute -top-[20px] -right-[20px] size-40 
                 border-4 border-black/10 
                 rounded-bl-[100%]"
        />
        <div className="text-center bg-white py-8 md:py-12 rounded-t-3xl shadow-lg">
          <div className="text-xl md:text-3xl! font-bold! cs-paragraph mb-1">
            {t("title")}
          </div>
          <div className="text-base md:text-lg! cs-paragraph-gray">
            {t("description")}
          </div>
        </div>
        <div className="p-6 md:p-12 bg-white rounded-b-3xl grid grid-cols-1 gap-6 shadow-lg">
          <div className="flex justify-between">
            <span className="cs-typography font-bold! text-base md:text-lg!">
              {t("homesSoldPerMonth")}
            </span>
            <span className="cs-typography-red font-black! text-2xl md:text-4xl!">
              {t("homesSoldValue")}
            </span>
          </div>
          <Slider
            hiddenStat={true}
            max={10000}
            min={0}
            step={1000}
            currentValue={4000}
            disabled
          />
          <div className="flex justify-between cs-paragraph-gray text-sm!">
            <span>{t("range.start")}</span>
            <span>{t("range.middle")}</span>
            <span>{t("range.end")}</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 md:p-8 bg-black/10 rounded-2xl gap-4">
            <span className="grid grid-cols-1 gap-2">
              <div className="cs-paragraph-gray font-bold! text-base md:text-lg!">
                {t("estimatedYearlyIncome")}
              </div>
              <div className="cs-paragraph-gray font-medium! text-sm!">
                {t("disclaimer", {
                  price: formatCurrency(averageHomePrice),
                })}
              </div>
            </span>
            <span className="text-center md:text-left">
              <span className="cs-typography-red font-black! text-2xl md:text-4xl!">
                {formatCurrency(yearlyIncome)}
              </span>
              <span className="cs-typography-gray font-black! text-sm md:text-base!">
                {t("incomeSuffix")}
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Earnings;
