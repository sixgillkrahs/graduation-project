"use client";

import { BrainCircuit, Eye, Lock, Mail, Shield, UserCheck } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

const PrivacyPolicy = () => {
  const t = useTranslations("PrivacyPolicy");
  const [activeSection, setActiveSection] = useState("s1");

  const SECTIONS = useMemo(
    () => [
      {
        id: "s1",
        title: t("sections.s1.menu"),
        icon: <UserCheck className="w-4 h-4" />,
      },
      {
        id: "s2",
        title: t("sections.s2.menu"),
        icon: <Eye className="w-4 h-4" />,
      },
      {
        id: "s3",
        title: t("sections.s3.menu"),
        icon: <Shield className="w-4 h-4" />,
      },
      {
        id: "s4",
        title: t("sections.s4.menu"),
        icon: <BrainCircuit className="w-4 h-4" />,
      },
      {
        id: "s5",
        title: t("sections.s5.menu"),
        icon: <Lock className="w-4 h-4" />,
      },
    ],
    [t],
  );

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = SECTIONS.map((section) =>
        document.getElementById(section.id),
      );

      const currentScrollPosition = window.scrollY + 100; // offset

      let currentActiveSection = SECTIONS[0].id;
      for (const section of sectionElements) {
        if (section && section.offsetTop <= currentScrollPosition) {
          currentActiveSection = section.id;
        }
      }

      setActiveSection(currentActiveSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [SECTIONS]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* 1. Page Header */}
      <div className="w-full py-20 px-6 md:px-12 lg:px-24 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold main-color-black mb-4">
            {t("header.title")}
          </h1>
          <p className="text-sm text-gray-500 mb-6 uppercase tracking-wider font-semibold">
            {t("header.effectiveDate")}
          </p>
          <p className="text-xl max-w-2xl mx-auto text-gray-600">
            {t("header.description")}
          </p>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="grow w-full px-4 md:px-12 lg:px-24 py-16 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 relative items-start">
          {/* Left Column: Sticky Table of Contents */}
          <div className="lg:w-1/4 hidden lg:block sticky top-32">
            <h3 className="text-lg font-bold mb-6 main-color-black uppercase tracking-wider">
              {t("header.contents")}
            </h3>
            <nav className="flex flex-col space-y-2 pr-4 relative">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gray-200" />
              {SECTIONS.map((section) => (
                <Link
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(section.id)?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  className={`flex items-center gap-3 py-3 px-4 text-sm font-medium transition-all duration-200 border-l-2 z-10 ${
                    activeSection === section.id
                      ? "bg-black/5"
                      : "border-transparent text-gray-500 hover:bg-black/5 hover:text-black"
                  }`}
                  style={{
                    borderLeftColor:
                      activeSection === section.id
                        ? "var(--color-red)"
                        : "transparent",
                    color:
                      activeSection === section.id
                        ? "var(--color-red)"
                        : undefined,
                  }}
                >
                  {section.icon}
                  {section.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Column: The Legal Document */}
          <div className="lg:w-3/4 max-w-3xl w-full leading-relaxed text-gray-700 text-lg">
            {/* Section 1 */}
            <section id="s1" className="mb-16 scroll-mt-32">
              <h2 className="text-2xl font-bold mb-6 main-color-black border-b pb-4">
                {t("sections.s1.title")}
              </h2>
              <p className="mb-4">{t("sections.s1.p1")}</p>
              <ul className="list-disc pl-6 space-y-3 mb-6 marker:text-gray-400">
                <li>{t("sections.s1.li1")}</li>
                <li>{t("sections.s1.li2")}</li>
                <li>{t("sections.s1.li3")}</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="s2" className="mb-16 scroll-mt-32">
              <h2 className="text-2xl font-bold mb-6 main-color-black border-b pb-4">
                {t("sections.s2.title")}
              </h2>
              <p className="mb-4">{t("sections.s2.p1")}</p>
              <ul className="list-disc pl-6 space-y-3 mb-6 marker:text-gray-400">
                <li>{t("sections.s2.li1")}</li>
                <li>{t("sections.s2.li2")}</li>
                <li>{t("sections.s2.li3")}</li>
                <li>{t("sections.s2.li4")}</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="s3" className="mb-16 scroll-mt-32">
              <h2 className="text-2xl font-bold mb-6 main-color-black border-b pb-4">
                {t("sections.s3.title")}
              </h2>
              <p className="mb-6">{t("sections.s3.p1")}</p>
              <div
                className="p-6 rounded-xl mb-6 shadow-sm border"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--color-red) 5%, white)",
                  borderColor:
                    "color-mix(in srgb, var(--color-red) 20%, white)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Shield
                    className="w-5 h-5 shrink-0"
                    style={{ color: "var(--color-red)" }}
                  />
                  <h4
                    className="font-semibold text-lg"
                    style={{ color: "var(--color-red)" }}
                  >
                    {t("sections.s3.clauseTitle")}
                  </h4>
                </div>
                <p className="text-gray-900 leading-relaxed font-medium">
                  {t("sections.s3.clauseContent")}
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="s4" className="mb-16 scroll-mt-32">
              <h2 className="text-2xl font-bold mb-6 main-color-black border-b pb-4">
                {t("sections.s4.title")}
              </h2>
              <p className="mb-4">{t("sections.s4.p1")}</p>
              <p className="mb-6">{t("sections.s4.p2")}</p>
            </section>

            {/* Section 5 */}
            <section id="s5" className="mb-16 scroll-mt-32 border-b-0">
              <h2 className="text-2xl font-bold mb-6 main-color-black border-b pb-4">
                {t("sections.s5.title")}
              </h2>
              <p className="mb-4">{t("sections.s5.p1")}</p>
            </section>
          </div>
        </div>
      </div>

      {/* 3. Footer / Contact Block */}
      <div className="w-full bg-black/5 py-12 px-6 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Mail className="w-6 h-6 main-color-black" />
          </div>
          <h3 className="text-xl font-semibold mb-3 main-color-black">
            {t("footer.questionsAbout")}
          </h3>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            {t("footer.reachOut")} <br className="hidden md:block" />
            <a
              href="mailto:privacy@havenly.com"
              className="font-semibold hover:underline mt-2 inline-block transition-all"
              style={{ color: "var(--color-red)" }}
            >
              privacy@havenly.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
