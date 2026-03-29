import clsx from "clsx";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Info,
  Loader2,
  MapPin,
  Wand2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { CsButton } from "@/components/custom";
import { useListingDraft } from "@/components/features/my-listings/components/ListingDraftContext";
import { Tabs } from "@/components/ui";
import { Input } from "@/components/ui/input";
import type { ItemTabs } from "@/components/ui/Tabs/tabs.types";
import { CsTextarea } from "@/components/ui/textarea";
import { useAIModeration } from "@/hooks/useAIModeration";
import { toast } from "@/lib/toast";
import { ROUTES } from "@/const/routes";
import type { RootState } from "@/store";
import { nextStep, resetListing } from "@/store/listing.store";
import type { ListingFormData } from "../../dto/listingformdata.dto";
import PropertyService from "../../services/service";

const BasicInfo = () => {
  const t = useTranslations("ListingForm");
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    control,
    setValue,
    trigger,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<ListingFormData>();
  const demandType = useWatch({ control, name: "demandType" });
  const description = useWatch({ control, name: "description" });
  const title = useWatch({ control, name: "title" });
  const propertyType = useWatch({ control, name: "propertyType" });
  const { saveDraft, isSavingDraft } = useListingDraft();

  // AI Moderation check for description hook
  useAIModeration({
    description,
    setError,
    clearErrors,
    errorType: errors.description?.type as string,
  });

  const handleContinue = async () => {
    if (errors.description?.type === "manual") {
      toast.error(t("toast.descriptionBlocked"));
      return;
    }

    const isValid = await trigger(PropertyService.stepFields.step1);
    if (isValid) {
      dispatch(nextStep());
    }
  };

  const profile = useSelector((state: RootState) => state.profile.data);
  const isPro = profile?.planInfo?.plan === "PRO";
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleCancel = () => {
    dispatch(resetListing());
    router.push(ROUTES.AGENT_LISTINGS);
  };

  const handleGenerateAI = async () => {
    const demandTypeLabel =
      demandType === "RENT"
        ? t("basicInfo.demandTypes.rent")
        : t("basicInfo.demandTypes.sale");
    const propertyTypeLabel = t(
      `basicInfo.propertyTypes.${propertyType.toLowerCase()}`,
    );

    if (!title || !propertyType) {
      toast.error(t("toast.aiMissingInputs"));
      return;
    }

    setIsGeneratingAI(true);
    // Simulate AI Generation
    setTimeout(() => {
      const generatedDesc = t("basicInfo.aiGeneratedDescription", {
        demandType: demandTypeLabel.toLowerCase(),
        propertyType: propertyTypeLabel.toLowerCase(),
        title,
      });
      setValue("description", generatedDesc);
      setIsGeneratingAI(false);
      toast.success(t("toast.aiGenerated"));
      // Optionally trigger validation
      trigger("description");
    }, 1500);
  };

  const demandTypes: ItemTabs[] = useMemo(
    () => [
      { title: t("basicInfo.demandTypes.rent") },
      { title: t("basicInfo.demandTypes.sale") },
    ],
    [t],
  );

  const handleTabChange = (index: number) => {
    const val = index === 0 ? "RENT" : "SALE";
    setValue("demandType", val);
  };

  const propertyTypes = useMemo(
    () => [
      {
        label: t("basicInfo.propertyTypes.apartment"),
        value: "APARTMENT",
        icon: <Building2 className="w-6 h-6" />,
      },
      {
        label: t("basicInfo.propertyTypes.house"),
        value: "HOUSE",
        icon: <Building2 className="w-6 h-6" />,
      },
      {
        label: t("basicInfo.propertyTypes.villa"),
        value: "VILLA",
        icon: <Building2 className="w-6 h-6" />,
      },
      {
        label: t("basicInfo.propertyTypes.land"),
        value: "LAND",
        icon: <MapPin className="w-6 h-6" />,
      },
      {
        label: t("basicInfo.propertyTypes.street_house"),
        value: "STREET_HOUSE",
        icon: <Building2 className="w-6 h-6" />,
      },
    ],
    [t],
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-w-[700px]">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Info className="w-6 h-6" /> {t("basicInfo.title")}
        </h2>
        <div className="space-y-6">
          <Controller
            name="title"
            control={control}
            rules={{
              required: t("validation.titleRequired"),
            }}
            render={({ field, fieldState }) => (
              <>
                <div className="">
                  <Input
                    label={t("basicInfo.fields.title.label")}
                    placeholder={t("basicInfo.fields.title.placeholder")}
                    {...field}
                    error={fieldState?.error?.message}
                  />
                </div>
              </>
            )}
          />
          <Controller
            name="description"
            control={control}
            rules={{
              required: t("validation.descriptionRequired"),
            }}
            render={({ field, fieldState }) => (
              <>
                <div className="relative group">
                  <CsTextarea
                    label={t("basicInfo.fields.description.label")}
                    {...field}
                    placeholder={t("basicInfo.fields.description.placeholder")}
                    error={fieldState?.error?.message}
                    className="pr-12 min-h-[120px]"
                  />
                  {isPro && (
                    <button
                      type="button"
                      disabled={isGeneratingAI}
                      onClick={handleGenerateAI}
                      title={t("basicInfo.aiButtonTitle")}
                      className="absolute right-3 top-9 p-2 rounded-lg bg-linear-to-r from-amber-200 to-amber-400 text-amber-900 shadow-md hover:shadow-lg hover:from-amber-300 hover:to-amber-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Wand2 className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          />
          <div className="w-[400px]">
            <label className="items-center text-sm font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4 has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10">
              {t("basicInfo.fields.demandType")}
            </label>
            <div className="mt-2">
              <Tabs
                items={demandTypes}
                fullWidth
                current={demandType === "SALE" ? 1 : 0}
                onChange={handleTabChange}
              />
            </div>
          </div>

          <Controller
            name="propertyType"
            control={control}
            render={({ field }) => (
              <>
                <label className="items-center text-sm font-medium select-none mb-3 block">
                  {t("basicInfo.fields.propertyType")}
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
                    label={t("basicInfo.fields.projectName.label")}
                    placeholder={t("basicInfo.fields.projectName.placeholder")}
                    {...field}
                  />
                </div>
              </>
            )}
          />
        </div>
        <div className="flex justify-between pt-10">
          <CsButton onClick={handleCancel} icon={<ArrowLeft />} type="button">
            {t("actions.cancel")}
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

export default BasicInfo;
