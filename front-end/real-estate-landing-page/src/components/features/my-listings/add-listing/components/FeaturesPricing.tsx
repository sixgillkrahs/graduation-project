import { CsButton } from "@/components/custom";
import { Icon } from "@/components/ui";
import { Counter } from "@/components/ui/counter";
import { Input } from "@/components/ui/input";
import { CsSelect } from "@/components/ui/select";
import { RootState } from "@/store";
import { prevStep, submitStep3 } from "@/store/listing.store";
import { Home, Sparkles } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

const FeaturesPricing = () => {
  const dispatch = useDispatch();
  const listingData = useSelector((state: RootState) => state.listing.data);
  const featuresData = listingData.features || {};

  const { control, handleSubmit } = useForm({
    defaultValues: {
      area: featuresData.area || "",
      price: featuresData.price || "",
      bedrooms: featuresData.bedrooms || 1,
      bathrooms: featuresData.bathrooms || 1,
      direction: featuresData.direction || "",
      legalStatus: featuresData.legalStatus || "",
      furniture: featuresData.furniture || "",
    },
  });

  const onSubmit = (data: any) => {
    dispatch(submitStep3({ features: data }));
  };

  const onBack = () => {
    dispatch(prevStep());
  };

  const directionOptions = [
    { label: "North", value: "North" },
    { label: "South", value: "South" },
    { label: "East", value: "East" },
    { label: "West", value: "West" },
    { label: "North East", value: "North East" },
    { label: "North West", value: "North West" },
    { label: "South East", value: "South East" },
    { label: "South West", value: "South West" },
  ];

  const legalStatusOptions = [
    { label: "Pink Book", value: "Pink Book" },
    { label: "Red Book", value: "Red Book" },
    { label: "Sales Contract", value: "Sales Contract" },
    { label: "Waiting for Book", value: "Waiting for Book" },
    { label: "Other", value: "Other" },
  ];

  const furnitureOptions = [
    { label: "Full", value: "Full" },
    { label: "Basic", value: "Basic" },
    { label: "None", value: "None" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-w-[700px]">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Home className="w-6 h-6" /> Step 3: Features & Pricing
        </h2>

        <form className="space-y-6">
          {/* Row 1: Area & Price */}
          <div className="grid grid-cols-2 gap-6">
            <Controller
              name="area"
              control={control}
              render={({ field }) => (
                <Input
                  label="Area (m²)"
                  type="number"
                  placeholder="e.g. 120"
                  {...field}
                />
              )}
            />
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <Input
                  label="Price (USD)"
                  type="number"
                  placeholder="e.g. 500000"
                  {...field}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-6 items-end">
            <Controller
              name="bedrooms"
              control={control}
              render={({ field }) => (
                <Counter
                  label="Bedrooms"
                  value={field.value}
                  onChange={field.onChange}
                  alignLabel="left"
                  className="flex justify-between w-full"
                />
              )}
            />
            <CsButton
              type="button"
              className="w-full"
              icon={<Sparkles className="w-4 h-4" />}
            >
              AI Price Suggestion
            </CsButton>
          </div>

          {/* Row 3: Bathrooms & Empty */}
          <div className="grid grid-cols-2 gap-6">
            <Controller
              name="bathrooms"
              control={control}
              render={({ field }) => (
                <Counter
                  label="Bathrooms"
                  value={field.value}
                  onChange={field.onChange}
                  alignLabel="left"
                  className="flex justify-between w-full"
                />
              )}
            />
            <div></div> {/* Empty column */}
          </div>

          {/* Row 4: Direction, Legal, Furniture */}
          <div className="grid grid-cols-3 gap-6">
            <Controller
              name="direction"
              control={control}
              render={({ field }) => (
                <CsSelect
                  label="Direction"
                  placeholder="Select Direction"
                  options={directionOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="legalStatus"
              control={control}
              render={({ field }) => (
                <CsSelect
                  label="Legal Status"
                  placeholder="Select Status"
                  options={legalStatusOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="furniture"
              control={control}
              render={({ field }) => (
                <CsSelect
                  label="Furniture"
                  placeholder="Select Furniture"
                  options={furnitureOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </form>
      </div>

      <div className="flex justify-between pt-10">
        <CsButton onClick={onBack} icon={<Icon.ArrowLeft />} type="button">
          Back
        </CsButton>
        <div className="flex gap-4">
          <CsButton onClick={() => {}} type="button">
            Save Draft
          </CsButton>
          <CsButton onClick={handleSubmit(onSubmit)} type="submit">
            Continue
            <Icon.ArrowRight className="w-5 h-5 ml-2" />
          </CsButton>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPricing;
