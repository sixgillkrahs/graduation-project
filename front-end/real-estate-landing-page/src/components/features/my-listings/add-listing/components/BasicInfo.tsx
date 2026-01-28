import { CsButton } from "@/components/custom";
import { Tabs } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { ItemTabs } from "@/components/ui/Tabs/tabs.types";
import { nextStep } from "@/store/listing.store";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Building2, Info, MapPin } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { useDispatch } from "react-redux";
import { ListingFormData, stepFields } from "../types";

const BasicInfo = () => {
  const dispatch = useDispatch();
  const { control, setValue, watch, trigger } =
    useFormContext<ListingFormData>();

  const formData = watch();

  const handleContinue = async () => {
    const isValid = await trigger(stepFields.step1);
    if (isValid) {
      dispatch(nextStep());
    }
  };

  const demandTypes: ItemTabs[] = [{ title: "Rent" }, { title: "Sale" }];

  const handleTabChange = (index: number) => {
    const val = index === 0 ? "RENT" : "SALE";
    setValue("demandType", val);
  };

  const propertyTypes = [
    {
      label: "Apartment",
      value: "APARTMENT",
      icon: <Building2 className="w-6 h-6" />,
    },
    {
      label: "House",
      value: "HOUSE",
      icon: <Building2 className="w-6 h-6" />,
    },
    {
      label: "Villa",
      value: "VILLA",
      icon: <Building2 className="w-6 h-6" />,
    },
    { label: "Land", value: "LAND", icon: <MapPin className="w-6 h-6" /> },
    {
      label: "Street House",
      value: "STREET_HOUSE",
      icon: <Building2 className="w-6 h-6" />,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-w-[700px]">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Info className="w-6 h-6" /> Step 1: Basic Information
        </h2>
        <form className="space-y-6">
          <div className="w-[400px]">
            <label className="cs-paragraph-black text-[16px] font-semibold mb-2 block">
              Demand Type
            </label>
            <div className="mt-2">
              <Tabs
                items={demandTypes}
                fullWidth
                current={formData.demandType === "SALE" ? 1 : 0}
                onChange={handleTabChange}
              />
            </div>
          </div>

          <Controller
            name="propertyType"
            control={control}
            render={({ field }) => (
              <>
                <label className="cs-paragraph-black text-[16px] font-semibold mb-2 block">
                  Property Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {propertyTypes.map((item) => {
                    const isSelected = field.value === item.value;
                    return (
                      <div
                        key={item.value}
                        onClick={() => field.onChange(item.value)}
                        className={clsx(
                          "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200 h-32",
                          isSelected
                            ? "border-black bg-gray-50 text-black"
                            : "border-gray-100 hover:border-black/20 hover:bg-gray-50 text-gray-600",
                        )}
                      >
                        <div
                          className={clsx(
                            "p-2 rounded-full",
                            isSelected
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-500",
                          )}
                        >
                          {item.icon}
                        </div>
                        <span className="font-medium text-sm text-center">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          />
          <Controller
            name="projectName"
            control={control}
            render={({ field }) => (
              <>
                <div className="">
                  <Input
                    label="Project Name (Optional)"
                    placeholder="e.g. Vinhomes Central Park"
                    {...field}
                  />
                </div>
              </>
            )}
          />
        </form>
        <div className="flex justify-between pt-10">
          <CsButton icon={<ArrowLeft />} type="button">
            Cancel
          </CsButton>
          <div className="flex gap-4">
            <CsButton type="button">Save Draft</CsButton>
            <CsButton onClick={handleContinue} type="button">
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </CsButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
