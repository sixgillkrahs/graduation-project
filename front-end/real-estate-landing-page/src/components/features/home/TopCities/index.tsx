"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { MoveRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/const/routes";

const TopCities = () => {
  const t = useTranslations("TopCities");
  const router = useRouter();

  const cities = [
    {
      id: "hanoi",
      name: t("hanoi"),
      image:
        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&q=80&w=800",
      query: "Hoan Kiem, Ha Noi",
    },
    {
      id: "hcmc",
      name: t("hcmc"),
      image:
        "https://images.unsplash.com/photo-1583417319070-4a69eb383306?auto=format&fit=crop&q=80&w=800",
      query: "Quan 1, Ho Chi Minh",
    },
    {
      id: "danang",
      name: t("danang"),
      image:
        "https://images.unsplash.com/photo-1559508551-44bff1de756b?auto=format&fit=crop&q=80&w=800",
      query: "Chau, Da Nang",
    },
    {
      id: "haiphong",
      name: t("haiphong"),
      image:
        "https://images.unsplash.com/photo-1528646033902-6c1e1ea25828?auto=format&fit=crop&q=80&w=800",
      query: "Ngo Quyen, Hai Phong",
    },
  ];

  const handleCityClick = (queryValue: string) => {
    const params = new URLSearchParams();
    params.append("query", queryValue);
    router.push(`${ROUTES.PROPERTIES}?${params.toString()}`);
  };

  return (
    <section className="container p-4 md:p-20 mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
          <h2 className="cs-typography text-2xl md:text-[40px]! font-semibold! mb-2">
            {t("title")}{" "}
            <span className="italic font-medium">{t("titleItalic")}</span>
          </h2>
          <p className="cs-paragraph-gray text-base">{t("description")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cities.map((city, index) => (
          <motion.div
            key={city.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group relative h-[320px] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow"
            onClick={() => handleCityClick(city.query)}
          >
            <Image
              src={city.image}
              alt={city.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
              <span className="text-2xl font-semibold tracking-wide">
                {city.name}
              </span>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <MoveRight className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TopCities;
