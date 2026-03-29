"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { ListingDraftProvider } from "@/components/features/my-listings/components/ListingDraftContext";
import { CsStep } from "@/components/ui/stepper";
import { ROUTES } from "@/const/routes";
import { toast } from "@/lib/toast";
import type { RootState } from "@/store";
import { resetListing, setStep } from "@/store/listing.store";
import type { ListingFormData } from "../dto/listingformdata.dto";
import { useCreateProperty } from "../services/mutate";
import PropertyService from "../services/service";
import BasicInfo from "./components/BasicInfo";
import FeaturesPricing from "./components/FeaturesPricing";
import Location from "./components/Location";
import MediaContent from "./components/MediaContent";
import Review from "./components/Review";

const AddListing = () => {
  const t = useTranslations("ListingForm");
  const dispatch = useDispatch();
  const router = useRouter();
  const currentStep = useSelector(
    (state: RootState) => state.listing.currentStep,
  );
  const listingData = useSelector((state: RootState) => state.listing.data);
  const { mutateAsync: createProperty, isPending: isSavingDraft } =
    useCreateProperty();
  const defaultValues = useMemo(
    () => PropertyService.getFormValuesFromListingState(listingData),
    [listingData],
  );

  const methods = useForm<ListingFormData>({
    defaultValues,
    mode: "onChange",
  });

  const onFinalSubmit = (data: ListingFormData) => {
    console.log("Final submission:", data);
  };

  const saveDraft = useCallback(async () => {
    try {
      await createProperty({
        ...methods.getValues(),
        status: "DRAFT",
      });
      toast.success(t("toast.draftSaved"));
      dispatch(resetListing());
      router.push(ROUTES.AGENT_LISTINGS);
    } catch (error) {
      toast.error(t("toast.draftSaveFailed"));
      console.error(error);
    }
  }, [createProperty, dispatch, methods, router, t]);

  const steps = useMemo(
    () => [
      { title: t("steps.basicInfo"), content: <BasicInfo /> },
      { title: t("steps.location"), content: <Location /> },
      { title: t("steps.featuresPricing"), content: <FeaturesPricing /> },
      { title: t("steps.media"), content: <MediaContent /> },
      { title: t("steps.review"), content: <Review /> },
    ],
    [t],
  );

  const draftContextValue = useMemo(
    () => ({ saveDraft, isSavingDraft }),
    [isSavingDraft, saveDraft],
  );

  return (
    <ListingDraftProvider value={draftContextValue}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onFinalSubmit)}>
          <div className="max-w-7xl mx-auto p-8 pb-24">
            <CsStep
              steps={steps}
              currentStep={currentStep + 1}
              onStepChange={(step) => dispatch(setStep(step - 1))}
              showNavigation={false}
            />
          </div>
        </form>
      </FormProvider>
    </ListingDraftProvider>
  );
};

export default AddListing;
