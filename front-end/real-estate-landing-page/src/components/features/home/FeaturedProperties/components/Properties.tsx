"use client";

import { CsButton } from "@/components/custom";
import { Icon, Tag } from "@/components/ui";
import { Bath, Bed, Maximize } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

const categories = [
  {
    name: "All",
  },
  {
    name: "Apartments",
  },
  {
    name: "Villa",
  },
  {
    name: "Duplex",
  },
  {
    name: "Warehouse",
  },
  {
    name: "Resort",
  },
];

const Card = ({
  name,
  location,
  price,
}: {
  name: string;
  location: string;
  price: string;
}) => {
  const router = useRouter();
  const t = useTranslations("PropertiesPage");

  const handleViewDetails = () => {
    router.push("/properties/1");
  };

  return (
    <div className="bg-white p-4 rounded-2xl cs-outline-gray shadow-md flex flex-col justify-between gap-8">
      <img
        src="https://placehold.co/600x400"
        alt="property"
        className="w-full h-70 object-cover rounded-xl"
      />
      <div className="px-2 flex flex-col justify-between gap-4">
        <div className="flex justify-between items-center">
          <span className="cs-paragraph text-xl! font-semibold!">
            ${price}
            <span className="text-sm text-gray-500">
              {t("currency.perMonth")}
            </span>
          </span>
          <CsButton
            className="cs-outline-black text-sm font-semibold border-none rounded-full"
            onClick={handleViewDetails}
          >
            {t("viewDetails")}
          </CsButton>
        </div>
        <div>
          <h3 className="cs-typography font-black! mb-3">{name}</h3>
          <h3 className="cs-typography-gray  text-[16px]!">{location}</h3>
        </div>
        <div className="bg-black/10 w-full h-px" />
        <div className="flex justify-start gap-4">
          <span className="cs-typography-gray  text-[16px]! font-medium! inline-flex items-center gap-1">
            <Bed className="main-color-red w-5 h-5" />3 {t("beds")}
          </span>
          <span className="cs-typography-gray  text-[16px]! font-medium! inline-flex items-center gap-1">
            <Bath className="main-color-red w-5 h-5" />3 {t("bathrooms")}
          </span>
          <span className="cs-typography-gray  text-[16px]! font-medium! inline-flex items-center gap-1 ">
            <Maximize className="main-color-red w-5 h-5" />3 m<sup>2</sup>
          </span>
        </div>
      </div>
    </div>
  );
};

const Properties = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isActive, setIsActive] = useState(1);
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
          {categories.map((category) => (
            <Tag
              key={category.name}
              title={category.name}
              className={`bg-black/10 main-color-black font-medium border-none ${
                activeCategory == category.name
                  ? "outline outline-1 outline-black"
                  : ""
              }`}
              onClick={() => setActiveCategory(category.name)}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <CsButton
            className="font-medium border-none rounded-full"
            icon={<Icon.ArrowLeft />}
            onClick={() => setIsActive(isActive - 1)}
          />
          <CsButton
            className="font-medium border-none rounded-full"
            icon={<Icon.ArrowRight />}
            onClick={() => setIsActive(isActive + 1)}
          ></CsButton>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card name="Apartments" location="Hanoi" price="1,000" />
        <Card name="Villa" location="Hanoi" price="2,000" />
        <Card name="Resort" location="Hanoi" price="1,000" />
      </div>
      <div className="flex justify-center items-center gap-2 my-8 h-12">
        {[1, 2, 3, 4].map((item) => {
          const active = isActive === item;
          return (
            <div
              key={item}
              onClick={() => setIsActive(item)}
              className={`relative cursor-pointer rounded-full transition-all ${
                active ? "size-3 bg-black" : "size-2 bg-black/20"
              }`}
            >
              {active && (
                <span className="absolute inset-px rounded-full border border-white" />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Properties;
