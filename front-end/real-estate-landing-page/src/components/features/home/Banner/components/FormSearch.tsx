import {
  Button,
  Icon,
  Input,
  Select,
  Slider,
  Tabs,
  Tag,
} from "@/components/ui";
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
    <div className="absolute bottom-4 left-4 right-4 md:bottom-2 md:right-20 md:left-auto z-10 max-w-sm md:max-w-md bg-white/90 backdrop-blur-md p-4 md:p-7 rounded-xl shadow-lg">
      <h2 className="text-2xl md:text-3xl font-bold text-black leading-tight mb-4">
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
      <div className="h-px bg-black/10 my-4"></div>
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Enter location"
          preIcon={<Icon.MapPin className="w-5 h-5 text-black" />}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select placeholder="Property Type" options={optionsType} />
          <Select placeholder="Bedrooms" options={optionsBedrooms} />
        </div>
        <Slider min={0} max={10000} step={1000} />
        <Button className="cs-bg-black text-white">Search</Button>
      </div>
      <div className="h-px bg-black/10 my-4"></div>
      <div className="flex  flex-col items-center gap-2">
        <span className="cs-paragraph-gray text-[16px]!">Popular Searches</span>
        <div className="flex gap-2 flex-wrap justify-center">
          <Tag title="Pet Friendly" />
          <Tag title="House" />
          <Tag title="Pool" />
        </div>
      </div>
    </div>
  );
};

export default memo(FormSearch);
