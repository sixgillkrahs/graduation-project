"use client";

import { Icon } from "../ui/Icon";
import { useTranslations } from "next-intl";
import Link from "next/link";
import LocaleSwitcher from "../ui/LocaleSwitcher";

const Label = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) => {
  return (
    <div className={`flex flex-col  w-full items-center gap-2 ${className}`}>
      <div className="flex justify-between items-center gap-2 w-full">
        <span className="cs-paragraph-white text-[16px]!">{label}</span>
        <span className="text-sm! cs-paragraph-gray">{value}</span>
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
      <footer className="p-4 md:p-20 grid grid-cols-1 container mx-auto">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 justify-between">
          <div className="cs-paragraph-white md:max-w-md">
            {t("description")}
            <br />
            {t("help")}
          </div>
          <div className="flex flex-col md:flex-row gap-8 md:gap-15">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
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
                    <Link href={"/work/become-agent"}>
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
                  <li>{t("menuAbout.FrequentlyAskedQuestions")}</li>
                  <li>{t("menuAbout.PrivacyPolicy")}</li>
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 min-w-0 md:min-w-[300px]">
              <Label label="Email" value="contact@realestate.com" />
              <Label label="Phone" value="0966999999" />
              <div className="mt-8">
                <div className={classText}>Follow Us</div>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-8">
          <div className="text-4xl md:text-[120px] lg:text-[220px] cs-typography-gray font-semibold!">
            Havenly
          </div>
          <LocaleSwitcher className="cs-paragraph-white mt-4 md:mt-0" />
        </div>
      </footer>
    </footer>
  );
};

export default Footer;
