import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { useDispatch } from "react-redux";
import { CsButton } from "@/components/custom";
import AmenitiesField from "@/components/features/my-listings/components/AmenitiesField";
import { Counter } from "@/components/ui/counter";
import { Input } from "@/components/ui/input";
import { CsSelect } from "@/components/ui/select";
import { nextStep, prevStep } from "@/store/listing.store";
import type { ListingFormData } from "../../dto/listingformdata.dto";
import PropertyService from "../../services/service";

const FeaturesPricing = () => {
  const dispatch = useDispatch();
  const { control, trigger, watch } = useFormContext<ListingFormData>();
  const demandType = watch("demandType");

  const handleContinue = async () => {
    const isValid = await trigger(PropertyService.stepFields.step3);
    if (isValid) {
      dispatch(nextStep());
    }
  };

  const onBack = () => {
    dispatch(prevStep());
  };

  const directionOptions = [
    { label: "North", value: "NORTH" },
    { label: "South", value: "SOUTH" },
    { label: "East", value: "EAST" },
    { label: "West", value: "WEST" },
    { label: "North East", value: "NORTH_EAST" },
    { label: "North West", value: "NORTH_WEST" },
    { label: "South East", value: "SOUTH_EAST" },
    { label: "South West", value: "SOUTH_WEST" },
  ];

  const legalStatusOptions = [
    { label: "Pink Book", value: "PINK_BOOK" },
    { label: "Red Book", value: "RED_BOOK" },
    { label: "Sales Contract", value: "SALE_CONTRACT" },
    { label: "Waiting for Book", value: "WAITING" },
    { label: "Other", value: "OTHER" },
  ];

  const furnitureOptions = [
    { label: "Full", value: "FULL" },
    { label: "Basic", value: "BASIC" },
    { label: "None", value: "EMPTY" },
  ];

  const currencyOptions = [
    { label: "VND", value: "VND" },
    { label: "USD", value: "USD" },
  ];

  const priceUnitOptionsSale = [
    { label: "Raw amount", value: "VND" },
    { label: "Million", value: "MILLION" },
    { label: "Billion", value: "BILLION" },
    { label: "Million / m2", value: "MILLION_PER_M2" },
  ];

  const priceUnitOptionsRent = [
    { label: "VND / month", value: "VND" },
    { label: "Million / month", value: "MILLION" },
  ];

  const priceUnitOptions =
    demandType === "RENT" ? priceUnitOptionsRent : priceUnitOptionsSale;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-w-[700px]">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Home className="w-6 h-6" /> Step 3: Features & Pricing
          {demandType === "RENT" ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
              🏠 Cho Thuê – Giá / Tháng
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
              🔑 Bán
            </span>
          )}
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-6">
            <Controller
              name="area"
              control={control}
              rules={{ required: "Area is required" }}
              render={({ field, fieldState }) => (
                <Input
                  label="Area (m2)"
                  type="number"
                  error={fieldState.error?.message}
                  placeholder="e.g. 120"
                  {...field}
                />
              )}
            />
            <Controller
              name="price"
              control={control}
              rules={{ required: "Price is required" }}
              render={({ field, fieldState }) => (
                <Input
                  label={demandType === "RENT" ? "Price / Month" : "Price"}
                  type="number"
                  error={fieldState.error?.message}
                  placeholder="e.g. 500000"
                  suffix={demandType === "RENT" ? "/tháng" : undefined}
                  {...field}
                />
              )}
            />
            <Controller
              name="currency"
              control={control}
              rules={{ required: "Currency is required" }}
              render={({ field, fieldState }) => (
                <CsSelect
                  label="Currency"
                  placeholder="Select Currency"
                  options={currencyOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="priceUnit"
              control={control}
              rules={{ required: "Price unit is required" }}
              render={({ field, fieldState }) => (
                <CsSelect
                  label="Price Unit"
                  placeholder="Select Unit"
                  options={priceUnitOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
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
          </div>

          <div className="grid grid-cols-3 gap-6">
            <Controller
              name="direction"
              control={control}
              rules={{ required: "Direction is required" }}
              render={({ field, fieldState }) => (
                <CsSelect
                  label="Direction"
                  placeholder="Select Direction"
                  options={directionOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="legalStatus"
              control={control}
              rules={{ required: "Legal Status is required" }}
              render={({ field, fieldState }) => (
                <CsSelect
                  label="Legal Status"
                  placeholder="Select Status"
                  options={legalStatusOptions}
                  value={field.value}
                  error={fieldState.error?.message}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="furniture"
              control={control}
              rules={{ required: "Furniture is required" }}
              render={({ field, fieldState }) => (
                <CsSelect
                  label="Furniture"
                  placeholder="Select Furniture"
                  options={furnitureOptions}
                  value={field.value}
                  error={fieldState.error?.message}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <Controller
            name="amenities"
            control={control}
            render={({ field, fieldState }) => (
              <AmenitiesField
                value={field.value || []}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <div className="flex justify-between pt-10">
          <CsButton onClick={onBack} icon={<ArrowLeft />} type="button">
            Back
          </CsButton>
          <div className="flex gap-4">
            <CsButton onClick={() => {}} type="button">
              Save Draft
            </CsButton>
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

export default FeaturesPricing;
