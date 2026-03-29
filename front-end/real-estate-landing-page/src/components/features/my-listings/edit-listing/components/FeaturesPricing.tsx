import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useDispatch } from "react-redux";
import { CsButton } from "@/components/custom";
import AmenitiesField from "@/components/features/my-listings/components/AmenitiesField";
import { useListingDraft } from "@/components/features/my-listings/components/ListingDraftContext";
import { Counter } from "@/components/ui/counter";
import { Input } from "@/components/ui/input";
import { CsSelect } from "@/components/ui/select";
import { nextStep, prevStep } from "@/store/listing.store";
import type { ListingFormData } from "../../dto/listingformdata.dto";
import PropertyService from "../../services/service";

const FeaturesPricing = () => {
  const t = useTranslations("ListingForm");
  const dispatch = useDispatch();
  const { control, trigger, watch, setValue, clearErrors } =
    useFormContext<ListingFormData>();
  const demandType = watch("demandType");
  const propertyType = watch("propertyType");
  const priceUnit = watch("priceUnit");
  const { saveDraft, isSavingDraft } = useListingDraft();
  const showLegalStatus = PropertyService.canShowLegalStatus(demandType);
  const showRoomFields = PropertyService.canShowRoomFields(propertyType);
  const showFurniture = PropertyService.canShowFurniture(propertyType);
  const priceUnitOptions = PropertyService.getPriceUnitOptions(demandType, {
    vnd: t("featuresPricing.priceUnits.vnd"),
    million: t("featuresPricing.priceUnits.million"),
    billion: t("featuresPricing.priceUnits.billion"),
    millionPerSquareMeter: t("featuresPricing.priceUnits.millionPerSquareMeter"),
    vndPerMonth: t("featuresPricing.priceUnits.vndPerMonth"),
    millionPerMonth: t("featuresPricing.priceUnits.millionPerMonth"),
  });

  useEffect(() => {
    if (!showLegalStatus) {
      setValue("legalStatus", "");
      clearErrors("legalStatus");
    }

    if (!showRoomFields) {
      setValue("bedrooms", 0);
      setValue("bathrooms", 0);
      clearErrors(["bedrooms", "bathrooms"]);
    }

    if (!showFurniture) {
      setValue("furniture", "");
      clearErrors("furniture");
    }
  }, [
    clearErrors,
    setValue,
    showFurniture,
    showLegalStatus,
    showRoomFields,
  ]);

  useEffect(() => {
    const validPriceUnits = priceUnitOptions.map((option) => option.value);

    if (!validPriceUnits.includes(priceUnit)) {
      setValue("priceUnit", PropertyService.defaultFormValues.priceUnit);
      clearErrors("priceUnit");
    }
  }, [clearErrors, priceUnit, priceUnitOptions, setValue]);

  const handleContinue = async () => {
    const isValid = await trigger(
      PropertyService.getStep3Fields({ demandType, propertyType }),
    );
    if (isValid) {
      dispatch(nextStep());
    }
  };

  const onBack = () => {
    dispatch(prevStep());
  };

  const directionOptions = [
    { label: t("featuresPricing.directionOptions.north"), value: "NORTH" },
    { label: t("featuresPricing.directionOptions.south"), value: "SOUTH" },
    { label: t("featuresPricing.directionOptions.east"), value: "EAST" },
    { label: t("featuresPricing.directionOptions.west"), value: "WEST" },
    {
      label: t("featuresPricing.directionOptions.northEast"),
      value: "NORTH_EAST",
    },
    {
      label: t("featuresPricing.directionOptions.northWest"),
      value: "NORTH_WEST",
    },
    {
      label: t("featuresPricing.directionOptions.southEast"),
      value: "SOUTH_EAST",
    },
    {
      label: t("featuresPricing.directionOptions.southWest"),
      value: "SOUTH_WEST",
    },
  ];

  const legalStatusOptions = [
    { label: t("featuresPricing.legalStatusOptions.pinkBook"), value: "PINK_BOOK" },
    { label: t("featuresPricing.legalStatusOptions.redBook"), value: "RED_BOOK" },
    {
      label: t("featuresPricing.legalStatusOptions.salesContract"),
      value: "SALE_CONTRACT",
    },
    { label: t("featuresPricing.legalStatusOptions.waiting"), value: "WAITING" },
    { label: t("featuresPricing.legalStatusOptions.other"), value: "OTHER" },
  ];

  const furnitureOptions = [
    { label: t("featuresPricing.furnitureOptions.full"), value: "FULL" },
    { label: t("featuresPricing.furnitureOptions.basic"), value: "BASIC" },
    { label: t("featuresPricing.furnitureOptions.none"), value: "EMPTY" },
  ];

  const currencyOptions = [
    { label: "VND", value: "VND" },
    { label: "USD", value: "USD" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-w-[700px]">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Home className="w-6 h-6" /> {t("featuresPricing.title")}
          {demandType === "RENT" ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
              {t("featuresPricing.badges.rent")}
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
              {t("featuresPricing.badges.sale")}
            </span>
          )}
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-6">
            <Controller
              name="area"
              control={control}
              rules={{ required: t("validation.areaRequired") }}
              render={({ field, fieldState }) => (
                <Input
                  label={t("featuresPricing.fields.area.label")}
                  type="number"
                  error={fieldState.error?.message}
                  placeholder={t("featuresPricing.fields.area.placeholder")}
                  {...field}
                />
              )}
            />
            <Controller
              name="price"
              control={control}
              rules={{ required: t("validation.priceRequired") }}
              render={({ field, fieldState }) => (
                <Input
                  label={
                    demandType === "RENT"
                      ? t("featuresPricing.fields.pricePerMonth.label")
                      : t("featuresPricing.fields.price.label")
                  }
                  type="number"
                  error={fieldState.error?.message}
                  placeholder={t("featuresPricing.fields.price.placeholder")}
                  suffix={
                    demandType === "RENT"
                      ? t("featuresPricing.fields.pricePerMonth.suffix")
                      : undefined
                  }
                  {...field}
                />
              )}
            />
            <Controller
              name="currency"
              control={control}
              rules={{ required: t("validation.currencyRequired") }}
              render={({ field, fieldState }) => (
                <CsSelect
                  label={t("featuresPricing.fields.currency.label")}
                  placeholder={t("featuresPricing.fields.currency.placeholder")}
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
              rules={{ required: t("validation.priceUnitRequired") }}
              render={({ field, fieldState }) => (
                <CsSelect
                  label={t("featuresPricing.fields.priceUnit.label")}
                  placeholder={t("featuresPricing.fields.priceUnit.placeholder")}
                  options={priceUnitOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>

          {showRoomFields && (
            <div className="grid grid-cols-2 gap-6 items-end">
              <Controller
                name="bedrooms"
                control={control}
                render={({ field }) => (
                  <Counter
                    label={t("featuresPricing.fields.bedrooms.label")}
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
                    label={t("featuresPricing.fields.bathrooms.label")}
                    value={field.value}
                    onChange={field.onChange}
                    alignLabel="left"
                    className="flex justify-between w-full"
                  />
                )}
              />
            </div>
          )}

          <div
            className={`grid gap-6 ${
              showLegalStatus && showFurniture
                ? "grid-cols-3"
                : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            <Controller
              name="direction"
              control={control}
              rules={{ required: t("validation.directionRequired") }}
              render={({ field, fieldState }) => (
                <CsSelect
                  label={t("featuresPricing.fields.direction.label")}
                  placeholder={t("featuresPricing.fields.direction.placeholder")}
                  options={directionOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
            {showLegalStatus && (
              <Controller
                name="legalStatus"
                control={control}
                rules={{ required: t("validation.legalStatusRequired") }}
                render={({ field, fieldState }) => (
                  <CsSelect
                    label={t("featuresPricing.fields.legalStatus.label")}
                    placeholder={t(
                      "featuresPricing.fields.legalStatus.placeholder",
                    )}
                    options={legalStatusOptions}
                    value={field.value}
                    error={fieldState.error?.message}
                    onChange={field.onChange}
                  />
                )}
              />
            )}
            {showFurniture && (
              <Controller
                name="furniture"
                control={control}
                rules={{ required: t("validation.furnitureRequired") }}
                render={({ field, fieldState }) => (
                  <CsSelect
                    label={t("featuresPricing.fields.furniture.label")}
                    placeholder={t(
                      "featuresPricing.fields.furniture.placeholder",
                    )}
                    options={furnitureOptions}
                    value={field.value}
                    error={fieldState.error?.message}
                    onChange={field.onChange}
                  />
                )}
              />
            )}
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
            {t("actions.back")}
          </CsButton>
          <div className="flex gap-4">
            <CsButton onClick={saveDraft} type="button" loading={isSavingDraft}>
              {t("actions.saveDraft")}
            </CsButton>
            <CsButton onClick={handleContinue} type="button">
              {t("actions.continue")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </CsButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPricing;
