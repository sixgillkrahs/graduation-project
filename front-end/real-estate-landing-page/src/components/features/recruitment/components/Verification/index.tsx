"use client";

import { useTranslations } from "next-intl";
import { memo, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { CsButton } from "@/components/custom";
import { Checkbox, Icon } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { CsSelect } from "@/components/ui/select";
import { toast } from "@/lib/toast";
import type {
  BasicInfo,
  Verification as VerificationType,
} from "@/models/basicInfo.model";
import type { AppDispatch, RootState } from "@/store";
import { prevStep, updateBasicInfo, updateVerification } from "@/store/store";
import { submitForm } from "@/store/thunks/formThunks";
import ExtractService from "../../services/service";

const Verification = () => {
  const t = useTranslations("RecruitmentPage");
  const dispatch = useDispatch<AppDispatch>();

  const { basicInfo, verification, isSubmitting } = useSelector(
    (state: RootState) => state.form,
  );
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BasicInfo & VerificationType>({
    defaultValues: {
      ...basicInfo,
      ...verification,
    },
    mode: "onChange",
  });

  useEffect(() => {
    reset({
      ...basicInfo,
      ...verification,
    });
  }, [basicInfo, verification, reset]);

  const handlePrev = () => {
    dispatch(prevStep());
  };

  const handleSubmitData = async (data: BasicInfo & VerificationType) => {
    dispatch(
      updateBasicInfo({
        identityInfo: data.identityInfo,
      }),
    );
    dispatch(
      updateVerification({
        agreeToTerms: data.agreeToTerms,
      }),
    );

    try {
      await dispatch(submitForm()).unwrap();
      toast.success(t("toast.submitSuccess"), { position: "top-center" });
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };

  return (
    <form>
      <div className="grid grid-cols-2 gap-4 my-4 ">
        <Controller
          name="identityInfo.fullName"
          control={control}
          rules={{
            required: t("validation.agentNameRequired"),
            minLength: {
              value: 2,
              message: t("validation.agentNameMin"),
            },
          }}
          render={({ field }) => (
            <Input
              label={t("verification.fields.fullName.label")}
              placeholder={t("verification.fields.fullName.placeholder")}
              error={errors.identityInfo?.fullName?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="identityInfo.IDNumber"
          control={control}
          rules={{
            required: t("validation.idNumberRequired"),
            minLength: {
              value: 12,
              message: t("validation.idNumberLength"),
            },
          }}
          render={({ field }) => (
            <Input
              label={t("verification.fields.idNumber.label")}
              placeholder={t("verification.fields.idNumber.placeholder")}
              error={errors.identityInfo?.IDNumber?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="identityInfo.gender"
          control={control}
          rules={{ required: t("validation.genderRequired") }}
          render={({ field }) => (
            <CsSelect
              label={t("verification.fields.gender.label")}
              placeholder={t("verification.fields.gender.placeholder")}
              options={[
                {
                  value: ExtractService.options[0].value,
                  label: t("verification.fields.gender.options.male"),
                },
                {
                  value: ExtractService.options[1].value,
                  label: t("verification.fields.gender.options.female"),
                },
              ]}
              error={errors.identityInfo?.gender?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="identityInfo.dateOfBirth"
          control={control}
          rules={{ required: t("validation.birthdayRequired") }}
          render={({ field }) => (
            <Input
              label={t("verification.fields.birthday.label")}
              placeholder={t("verification.fields.birthday.placeholder")}
              error={errors.identityInfo?.dateOfBirth?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="identityInfo.nationality"
          control={control}
          rules={{ required: t("validation.nationalityRequired") }}
          render={({ field }) => (
            <Input
              label={t("verification.fields.nationality.label")}
              placeholder={t("verification.fields.nationality.placeholder")}
              error={errors.identityInfo?.nationality?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="identityInfo.placeOfBirth"
          control={control}
          rules={{ required: t("validation.addressRequired") }}
          render={({ field }) => (
            <Input
              label={t("verification.fields.address.label")}
              placeholder={t("verification.fields.address.placeholder")}
              error={errors.identityInfo?.placeOfBirth?.message}
              {...field}
            />
          )}
        />
      </div>

      <div className="p-4 bg-black/5 w-full rounded-lg border border-black/10 mt-8">
        <Controller
          name="agreeToTerms"
          control={control}
          rules={{
            required: t("validation.agreeToTermsRequired"),
          }}
          render={({ field: { value, onChange, ...restField } }) => (
            <Checkbox
              label={t("verification.terms.label")}
              subtext={t("verification.terms.subtext")}
              error={errors.agreeToTerms?.message}
              checked={value}
              {...restField}
              onChange={(e) => {
                const isChecked = e.target.checked;
                onChange(isChecked);
                dispatch(updateVerification({ agreeToTerms: isChecked }));
              }}
            />
          )}
        />
      </div>
      <div className="flex justify-between pt-6">
        <CsButton
          className="px-6 py-2 rounded-full"
          onClick={handlePrev}
          type="button"
          icon={<Icon.ArrowLeft className="w-5 h-5" />}
          disabled={isSubmitting}
        >
          {t("actions.back")}
        </CsButton>
        <CsButton
          className="cs-bg-black text-white px-6 py-2 rounded-full"
          onClick={handleSubmit(handleSubmitData)}
          disabled={isSubmitting}
          // loading={isSubmitting}
        >
          {isSubmitting ? t("actions.submitting") : t("actions.submit")}
        </CsButton>
      </div>
    </form>
  );
};

export default memo(Verification);
