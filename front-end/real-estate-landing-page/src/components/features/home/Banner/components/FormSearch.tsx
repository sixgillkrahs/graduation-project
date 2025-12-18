import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon/Icon";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Slider from "@/components/ui/Slider";
import Tabs from "@/components/ui/Tabs";
import Tag from "@/components/ui/Tag";
import { memo } from "react";

const optionsType = [
  {
    label: "Apartment",
    value: "partment",
  },
  {
    label: "House",
    value: "house",
  },
];

const optionsBedrooms = [
  {
    label: "1 Bedroom",
    value: "1",
  },
  {
    label: "2 Bedroom",
    value: "2",
  },
  {
    label: "3 Bedroom",
    value: "3",
  },
  {
    label: "4 Bedroom",
    value: "4",
  },
];

const FormSearch = () => {
  return (
    <div className="absolute bottom-10 right-20 z-10 max-w-md bg-white/90 backdrop-blur-md p-10 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-black leading-tight mb-6">
        Start Your Search Today
      </h2>
      <Tabs
        items={[
          {
            title: "Rent",
          },
          {
            title: "Sell",
          },
        ]}
      />
      <div className="h-px bg-black/10 my-6"></div>
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Enter location"
          preIcon={<Icon.MapPin className="w-5 h-5 text-black" />}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select placeholder="Property Type" options={optionsType} />
          <Select placeholder="Bedrooms" options={optionsBedrooms} />
        </div>
        <Slider />
        <Button className="cs-bg-black text-white">Search</Button>
      </div>
      <div className="h-px bg-black/10 my-6"></div>
      <div className="flex  flex-col items-center gap-2">
        <span className=" cs-paragraph-gray text-[16px]!">
          Popular Searches
        </span>
        <div className="flex gap-4">
          <Tag title="Pet Friendly" />
          <Tag title="House" />
          <Tag title="Pool" />
        </div>
      </div>
    </div>
  );
};

export default memo(FormSearch);
