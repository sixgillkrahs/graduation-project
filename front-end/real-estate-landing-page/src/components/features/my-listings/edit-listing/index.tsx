"use client";

import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { ListingDraftProvider } from "@/components/features/my-listings/components/ListingDraftContext";
import { CsStep } from "@/components/ui/stepper";
import { ROUTES } from "@/const/routes";
import { toast } from "@/lib/toast";
import type { ListingState } from "@/models/listing.model";
import type { RootState } from "@/store";
import {
  resetListing,
  setStep,
  updateListingData,
} from "@/store/listing.store";
import type { ListingFormData } from "../dto/listingformdata.dto";
import { useUpdateProperty } from "../services/mutate";
import { useGetPropertyDetail } from "../services/query";
import PropertyService from "../services/service";
import BasicInfo from "./components/BasicInfo";
import FeaturesPricing from "./components/FeaturesPricing";
import Location from "./components/Location";
import MediaContent from "./components/MediaContent";
import Review from "./components/Review";

const EditListing = () => {
  const t = useTranslations("ListingForm");
  const dispatch = useDispatch();
  const router = useRouter();
  const currentStep = useSelector(
    (state: RootState) => state.listing.currentStep,
  );
  const [isReady, setIsReady] = useState(false);
  const params = useParams();
  const propertyId = params.id as string;
  const { mutateAsync: updateProperty, isPending: isSavingDraft } =
    useUpdateProperty();

  // Fetch property details
  const { data: propertyResponse, isLoading } =
    useGetPropertyDetail(propertyId);

  const methods = useForm<ListingFormData>({
    defaultValues: PropertyService.defaultFormValues,
    mode: "onChange",
  });

  // Pre-populate Form and Redux Store when data implies
  useEffect(() => {
    if (propertyResponse?.data) {
      const p = propertyResponse.data;

      const hydratedData = PropertyService.getFormValuesFromProperty(p);

      // Hydrate via RHF reset
      methods.reset(hydratedData);

      // Sync into Redux
      // Map to Redux structure (which has location/features/media objects)
      dispatch(
        updateListingData({
          demandType: p.demandType,
          propertyType: hydratedData.propertyType,
          projectName: p.projectName,
          title: p.title,
          description: p.description,
          location: {
            province: hydratedData.province,
            ward: hydratedData.ward,
            address: hydratedData.address,
            latitude: hydratedData.latitude,
            longitude: hydratedData.longitude,
          },
          features: {
            area: hydratedData.area,
            price: hydratedData.price,
            currency: hydratedData.currency,
            priceUnit: hydratedData.priceUnit,
            bedrooms: hydratedData.bedrooms,
            bathrooms: hydratedData.bathrooms,
            direction: hydratedData.direction,
            legalStatus: hydratedData.legalStatus,
            furniture: hydratedData.furniture,
          },
          amenities: hydratedData.amenities,
          media: {
            images: hydratedData.images || [],
            thumbnail: hydratedData.thumbnail,
            videoLink: hydratedData.videoLink,
            virtualTourUrls: hydratedData.virtualTourUrls,
          },
        } satisfies Partial<ListingState["data"]>),
      );

      dispatch(setStep(0)); // Start from beginning
      setIsReady(true);
    }
  }, [propertyResponse, methods, dispatch]);

  const onFinalSubmit = (data: ListingFormData) => {
    console.log("Final submission:", data);
  };

  const saveDraft = useCallback(async () => {
    try {
      await updateProperty({
        id: propertyId,
        data: {
          ...methods.getValues(),
          status: "DRAFT",
        },
      });
      toast.success(t("toast.draftSaved"));
      dispatch(resetListing());
      router.push(ROUTES.AGENT_LISTINGS);
    } catch (error) {
      toast.error(t("toast.draftSaveFailed"));
      console.error(error);
    }
  }, [dispatch, methods, propertyId, router, t, updateProperty]);

  const steps = useMemo(
    () => [
      { title: t("steps.basicInfo"), content: <BasicInfo /> },
      { title: t("steps.location"), content: <Location /> },
      { title: t("steps.featuresPricing"), content: <FeaturesPricing /> },
      { title: t("steps.media"), content: <MediaContent /> },
      { title: t("steps.review"), content: <Review propertyId={propertyId} /> },
    ],
    [propertyId, t],
  );

  const draftContextValue = useMemo(
    () => ({ saveDraft, isSavingDraft }),
    [isSavingDraft, saveDraft],
  );

  if (isLoading || !isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500">{t("edit.loading")}</p>
      </div>
    );
  }

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

export default EditListing;
