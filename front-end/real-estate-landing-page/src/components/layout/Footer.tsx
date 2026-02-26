"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/const/routes";
import { Icon } from "../ui/Icon";

const LocaleSwitcher = () => {
  const router = useRouter();

  const setLocale = async (locale: "en" | "vi") => {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });

    router.refresh();
  };
  return (
    <div className="flex gap-2 items-center">
      <div
        className="underline text-[20px]! cs-paragraph-white cursor-pointer"
        onClick={() => setLocale("vi")}
      >
        vi
      </div>
      <div
        className="underline text-[20px]! cs-paragraph-white cursor-pointer"
        onClick={() => setLocale("en")}
      >
        en
      </div>
    </div>
  );
};

const Label = ({
  label,
  value,
  href,
  className,
}: {
  label: string;
  value: string;
  href?: string;
  className?: string;
}) => {
  return (
    <div className={`flex flex-col  w-full items-center gap-2 ${className}`}>
      <div className="flex justify-between items-center gap-2 w-full">
        <span className="cs-paragraph-white text-[16px]!">{label}</span>
        {href ? (
          <a
            href={href}
            className="text-sm! cs-paragraph-gray hover:text-white transition-colors"
          >
            {value}
          </a>
        ) : (
          <span className="text-sm! cs-paragraph-gray">{value}</span>
        )}
      </div>
      <div className="w-full h-[0.5px] cs-bg-gray"></div>
    </div>
  );
};

const Footer = () => {
  const t = useTranslations("Footer");

  const classIcon =
    "text-white cs-bg-gray p-2 rounded-full w-10 h-10 active:scale-90 transition-all duration-300 cursor-pointer";
  const classText = "cs-paragraph-white text-[16px]!";
  const classLi = "text-sm! cs-paragraph-gray grid grid-cols-1 gap-3 mt-4";

  return (
    <footer className="cs-bg-black">
      <div className="px-5 py-10 lg:p-20 flex flex-col container mx-auto gap-8">
        <div className="flex flex-col xl:flex-row gap-12 justify-between">
          <div className="cs-paragraph-white xl:max-w-sm">
            {t("description")}
            <br />
            <br className="hidden xl:block" />
            {t("help")}
          </div>
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-15 w-full xl:w-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 w-full lg:w-auto">
              <div>
                <span className={classText}>
                  {t("titlebrowser", { name: "Havenly" })}
                </span>
                <ul className={classLi}>
                  <li>{t("menu.ListForRent")}</li>
                  <li>{t("menu.PublishForSell")}</li>
                  <li>{t("menu.Invest")}</li>
                </ul>
              </div>
              <div>
                <span className={classText}>
                  {t("workAt", { name: "Havenly" })}
                </span>
                <ul className={classLi}>
                  <li>
                    <Link href={`${ROUTES.BECOME_AGENT}`}>
                      {t("menuWorkAt.BecomeAgent", { name: "Havenly" })}
                    </Link>
                  </li>
                  <li>{t("menuWorkAt.BePhotographer", { name: "Havenly" })}</li>
                </ul>
              </div>
              <div>
                <span className={classText}>
                  {t("About", { name: "Havenly" })}
                </span>
                <ul className={classLi}>
                  <Link href={`${ROUTES.FAQ}`}>
                    {t("menuAbout.FrequentlyAskedQuestions")}
                  </Link>
                  <Link href={`${ROUTES.PRIVACY_POLICY}`}>
                    {t("menuAbout.PrivacyPolicy")}
                  </Link>
                </ul>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full lg:min-w-[300px] lg:w-auto">
              <Label
                label={t("email")}
                value="contact@realestate.com"
                href="mailto:contact@realestate.com"
              />
              <Label
                label={t("phone")}
                value="0966999999"
                href="tel:0966999999"
              />
              <div className="mt-8">
                <div className={classText}>{t("followUs")}</div>
                <div className="flex gap-4 mt-4">
                  <Icon.Facebook className={classIcon} />
                  <Icon.TwitterX className={classIcon} />
                  <Icon.Youtube className={classIcon} />
                  <Icon.Instagram className={classIcon} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mt-8 lg:mt-0 gap-6">
          <div className="text-[60px]! sm:text-[100px]! lg:text-[220px]! cs-typography-gray font-semibold! leading-none">
            Havenly
          </div>
          <div className="pb-2 lg:pb-12">
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
