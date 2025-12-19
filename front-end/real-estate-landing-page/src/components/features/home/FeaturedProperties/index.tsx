import { Button } from "@/components/ui";
import Properties from "./components/Properties";
import { useTranslations } from "next-intl";

const FeaturedProperties = () => {
  const t = useTranslations("HomePage");
  return (
    <section className="px-20 container mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="cs-typography text-[40px]! font-semibold! mb-3">
            Featured <span className="italic font-normal">Properties</span>
          </span>
          <span className="cs-paragraph-gray max-w-[800px] text-center text-[16px]!">
            Discover our hand-picked selection of premium rentals.
          </span>
        </div>
        <Button className="text-white cs-bg-black">View All Properties</Button>
      </div>
      <div className="h-px w-full bg-[#E5E5E5] my-6" />
      <Properties />
    </section>
  );
};

export default FeaturedProperties;
