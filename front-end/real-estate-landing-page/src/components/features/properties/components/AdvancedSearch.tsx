import { CsButton } from "@/components/custom";
import { CsSelect } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui"; // Changed to correct import
import { ChevronDown, MapPin, Search } from "lucide-react";
import { useState } from "react";

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "land", label: "Land/Plot" },
  { value: "house", label: "Townhouse" },
  { value: "commercial", label: "Commercial" },
];

const AdvancedSearch = () => {
  const [maxPrice, setMaxPrice] = useState(5); // Billion VND

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm py-4">
      <div className="container mx-auto px-4 md:px-20">
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white md:bg-gray-50 md:p-2 md:rounded-full border border-gray-100 md:border-gray-200">
          {/* Location Input */}
          <div className="w-full md:flex-1 relative group">
            <Input
              placeholder="Search City, District, or Project..."
              preIcon={<MapPin className="w-5 h-5 text-emerald-600" />}
              className="border-none shadow-none bg-transparent h-12 text-base placeholder:text-gray-400 focus-visible:ring-0 px-0 md:px-4 pl-10!"
            />
            {/* Mobile separator */}
            <div className="md:hidden h-[1px] w-full bg-gray-100 my-2"></div>
          </div>

          <div className="hidden md:block w-[1px] h-8 bg-gray-300"></div>

          {/* Type Dropdown */}
          <div className="w-full md:w-48">
            <CsSelect
              placeholder="Property Type"
              options={PROPERTY_TYPES}
              className="border-none shadow-none bg-transparent h-12 focus:ring-0"
            />
            <div className="md:hidden h-[1px] w-full bg-gray-100 my-2"></div>
          </div>

          <div className="hidden md:block w-[1px] h-8 bg-gray-300"></div>

          {/* Price Range Dropdown/Popover */}
          <div className="w-full md:w-64">
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full h-12 flex items-center justify-between px-3 text-left text-gray-700 hover:text-emerald-700 transition-colors">
                  <span className="truncate font-medium">
                    Up to {maxPrice} Billion VND
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="center">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Max Price</h4>
                  <div className="pt-2 pb-6 px-2">
                    <Slider
                      min={0}
                      max={20}
                      step={0.5}
                      currentValue={maxPrice}
                      onChange={(val) => setMaxPrice(val)}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-emerald-700">
                    <span>0</span>
                    <span>{maxPrice} Billion</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="w-full md:w-auto mt-2 md:mt-0">
            <CsButton
              className="w-full md:w-auto rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base h-12 px-8 shadow-lg shadow-emerald-200"
              icon={<Search className="w-5 h-5 mr-1" />}
            >
              Search
            </CsButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
