import { useTranslations } from "next-intl";
import { memo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { CsButton } from "@/components/custom";
import { Icon, Upload } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { CsSelect } from "@/components/ui/select";
import { vietnamProvinces } from "@/const/vietnam-provinces";
import { toast } from "@/lib/toast";
import type { BusinessInfo as BusinessInfoType } from "@/models/basicInfo.model";
import { useUploadImages } from "@/shared/upload/mutate";
import type { AppDispatch, RootState } from "@/store";
import { nextStep, prevStep, updateBusinessInfo } from "@/store/store";

type BusinessInfoFormType = Omit<BusinessInfoType, "certificateImage"> & {
  certificateImage: File[];
};

const validateBusinessInfo = (
  values: BusinessInfoFormType,
  t: (key: string) => string,
) => {
  const errors: Record<string, string> = {};
  if (!values.certificateImage?.length) {
    errors.certificateImage = t("validation.certificateImageRequired");
  }
  return errors;
};

const BusinessInfo = () => {
  const t = useTranslations("RecruitmentPage");
  const dispatch = useDispatch<AppDispatch>();
  const [uploading, setUploading] = useState(false);
  const { mutateAsync: uploadImages } = useUploadImages();
  const { businessInfo, isSubmitting } = useSelector(
    (state: RootState) => state.form,
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessInfoFormType>({
    defaultValues: {
      ...businessInfo,
      certificateImage: [],
    },
    mode: "onChange",
  });

  const onSubmit = (data: BusinessInfoFormType) => {
    const errors = validateBusinessInfo(data, (key) => t(key));
    if (Object.keys(errors).length > 0) return;
    const payload = {
      ...data,
      certificateImage: businessInfo.certificateImage,
    };

    dispatch(updateBusinessInfo(payload));
    dispatch(nextStep());
  };

  const handleUploadImage = async (files: File[]) => {
    if (!files.length) return;

    setUploading(true);

    try {
      const response = await uploadImages([files[0]]);
      const uploadedImageUrl = response.data.files[0]?.url;

      if (uploadedImageUrl) {
        dispatch(
          updateBusinessInfo({
            certificateImage: [uploadedImageUrl],
          }),
        );
      } else {
        toast.error(t("toast.uploadError"));
      }
    } catch (_err) {
      toast.error(t("toast.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handlePrev = () => {
    dispatch(prevStep());
  };

  return (
    <div className="flex flex-col gap-4 pt-3">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="certificateNumber"
            control={control}
            rules={{
              required: t("validation.certificateNumberRequired"),
            }}
            render={({ field }) => (
              <Input
                label={t("businessInfo.fields.certificateNumber.label")}
                placeholder={t(
                  "businessInfo.fields.certificateNumber.placeholder",
                )}
                error={errors.certificateNumber?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="taxCode"
            control={control}
            rules={{
              required: t("validation.taxCodeRequired"),
            }}
            render={({ field }) => (
              <Input
                label={t("businessInfo.fields.taxCode.label")}
                placeholder={t("businessInfo.fields.taxCode.placeholder")}
                error={errors.taxCode?.message}
                {...field}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Controller
            name="yearsOfExperience"
            control={control}
            rules={{
              required: t("validation.yearsOfExperienceRequired"),
              pattern: {
                value: /^[0-9]{0,}$/,
                message: t("validation.numberOnly"),
              },
            }}
            render={({ field }) => (
              <Input
                label={t("businessInfo.fields.yearsOfExperience.label")}
                placeholder={t(
                  "businessInfo.fields.yearsOfExperience.placeholder",
                )}
                suffix={t("businessInfo.fields.yearsOfExperience.suffix")}
                error={errors.yearsOfExperience?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="specialization"
            control={control}
            rules={{
              required: t("validation.specializationRequired"),
            }}
            render={({ field }) => (
              <CsSelect
                label={t("businessInfo.fields.specialization.label")}
                error={errors.specialization?.message}
                multiple
                options={[
                  {
                    value: "APARTMENT",
                    label: t(
                      "businessInfo.fields.specialization.options.apartment",
                    ),
                  },
                  {
                    value: "LAND",
                    label: t("businessInfo.fields.specialization.options.land"),
                  },
                ]}
                {...field}
              />
            )}
          />
        </div>
        <div className="grid mt-3">
          <Controller
            name="workingArea"
            control={control}
            rules={{
              required: t("validation.workingAreaRequired"),
            }}
            render={({ field }) => (
              <CsSelect
                multiple
                label={t("businessInfo.fields.workingArea.label")}
                error={errors.workingArea?.message}
                options={vietnamProvinces}
                {...field}
              />
            )}
          />
        </div>
        <div className="mt-3">
          <Controller
            name="certificateImage"
            control={control}
            rules={{
              required: t("validation.certificateImageRequired"),
              validate: (val) =>
                (val && val.length > 0) ||
                t("validation.certificateImageRequired"),
            }}
            render={({
              field: { onChange, value, ...restField },
              fieldState: { error },
            }) => (
              <Upload
                label={t("businessInfo.fields.certificateImage.label")}
                accept="image/jpeg,image/png"
                {...restField}
                value={value || []}
                onChange={(files) => {
                  onChange(files);
                  handleUploadImage(files);
                }}
                error={error?.message}
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
            type="submit"
            loading={uploading}
            disabled={uploading || isSubmitting}
          >
            {t("actions.next")}
          </CsButton>
        </div>
      </form>
    </div>
  );
};

export default memo(BusinessInfo);
