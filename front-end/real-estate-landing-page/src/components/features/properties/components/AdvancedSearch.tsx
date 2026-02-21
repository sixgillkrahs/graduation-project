import { CsButton } from "@/components/custom";
import { CsSelect } from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui";
import { ChevronDown, Search } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import LocationAutocomplete from "./LocationAutocomplete";

interface SearchFormValues {
  query: string;
  demandType: string;
  propertyType: string;
  maxPrice: number;
}

export interface SearchFilters {
  demandType?: string;
  propertyType?: string;
  maxPrice?: number;
  query?: string;
}

interface AdvancedSearchProps {
  onSearchChange?: (filters: SearchFilters) => void;
}

const buildSearchFilters = (data: SearchFormValues): SearchFilters => {
  const filters: SearchFilters = {};
  if (data.demandType && data.demandType !== "all")
    filters.demandType = data.demandType;
  if (data.propertyType && data.propertyType !== "all")
    filters.propertyType = data.propertyType;
  if (data.maxPrice < 20) filters.maxPrice = data.maxPrice;
  if (data.query.trim()) filters.query = data.query.trim();
  return filters;
};

const AdvancedSearch = ({ onSearchChange }: AdvancedSearchProps) => {
  const t = useTranslations("PropertiesPage.search");

  const DEMAND_TYPES = [
    { value: "all", label: t("demandAll") },
    { value: "SALE", label: t("demandSale") },
    { value: "RENT", label: t("demandRent") },
  ];

  const PROPERTY_TYPES = [
    { value: "all", label: t("typeAll") },
    { value: "APARTMENT", label: t("typeApartment") },
    { value: "HOUSE", label: t("typeHouse") },
    { value: "STREET_HOUSE", label: t("typeStreetHouse") },
    { value: "VILLA", label: t("typeVilla") },
    { value: "LAND", label: t("typeLand") },
    { value: "OTHER", label: t("typeOther") },
  ];

  const { control, handleSubmit, watch } = useForm<SearchFormValues>({
    defaultValues: {
      query: "",
      demandType: "all",
      propertyType: "all",
      maxPrice: 5,
    },
  });

  const maxPrice = watch("maxPrice");

  const onSubmit = (data: SearchFormValues) => {
    onSearchChange?.(buildSearchFilters(data));
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm py-4">
      <div className="container mx-auto px-4 md:px-20">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col md:flex-row items-center gap-4 bg-white md:bg-gray-50 md:p-2 md:rounded-full border border-gray-100 md:border-gray-200"
        >
          {/* Location Input with Autocomplete */}
          <div className="w-full md:flex-1 relative group">
            <Controller
              name="query"
              control={control}
              render={({ field }) => (
                <LocationAutocomplete
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("placeholder")}
                />
              )}
            />
            <div className="md:hidden h-px w-full bg-gray-100 my-2"></div>
          </div>

          <div className="hidden md:block w-px h-8 bg-gray-300"></div>

          {/* Demand Type */}
          <div className="w-full md:w-40">
            <Controller
              name="demandType"
              control={control}
              render={({ field }) => (
                <CsSelect
                  placeholder={t("demandType")}
                  value={field.value}
                  onChange={field.onChange}
                  options={DEMAND_TYPES}
                  className="border-none shadow-none bg-transparent focus:ring-0 h-auto!"
                />
              )}
            />
            <div className="md:hidden h-px w-full bg-gray-100 my-2"></div>
          </div>

          <div className="hidden md:block w-px h-8 bg-gray-300"></div>

          {/* Property Type */}
          <div className="w-full md:w-48">
            <Controller
              name="propertyType"
              control={control}
              render={({ field }) => (
                <CsSelect
                  placeholder={t("propertyType")}
                  value={field.value}
                  onChange={field.onChange}
                  options={PROPERTY_TYPES}
                  className="border-none shadow-none bg-transparent h-auto! focus:ring-0"
                />
              )}
            />
            <div className="md:hidden h-px w-full bg-gray-100 my-2"></div>
          </div>

          <div className="hidden md:block w-px h-8 bg-gray-300"></div>

          {/* Price Range */}
          <div className="w-full md:w-64">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full h-12 flex items-center justify-between px-3 text-left text-gray-700 hover:text-red-500 transition-colors"
                >
                  <span className="truncate font-medium">
                    {t("priceLabel", { price: maxPrice })}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="center">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    {t("maxPrice")}
                  </h4>
                  <div className="pt-2 px-2">
                    <Controller
                      name="maxPrice"
                      control={control}
                      render={({ field }) => (
                        <Slider
                          min={0}
                          max={20}
                          step={0.5}
                          currentValue={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="w-full md:w-auto mt-2 md:mt-0">
            <CsButton
              type="submit"
              className="w-full md:w-auto rounded-full text-white font-bold text-base h-12 px-8 shadow-lg"
              icon={<Search className="w-5 h-5 mr-1" />}
            >
              {t("searchBtn")}
            </CsButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedSearch;
