"use client";

import { useTranslations } from "next-intl";
import { memo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { CsButton } from "@/components/custom";
import { Icon, Upload } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import type { BasicInfo as BasicInfoType } from "@/models/basicInfo.model";
import { useUploadImages } from "@/shared/upload/mutate";
import type { AppDispatch, RootState } from "@/store";
import { nextStep, updateBasicInfo } from "@/store/store";
import { useExtractID } from "../../services/mutation";

type BasicInfoFormValues = Omit<
  BasicInfoType,
  "identityFront" | "identityBack"
> & {
  identityFront: File[];
  identityBack: File[];
};

const validateBasicInfo = (
  data: BasicInfoFormValues,
  t: (key: string) => string,
) => {
  const errors: Record<string, string> = {};
  if (!data.nameRegister) {
    errors.nameRegister = t("validation.nameRequired");
  }
  if (!data.email) {
    errors.email = t("validation.emailRequired");
  }
  if (!data.phoneNumber) {
    errors.phoneNumber = t("validation.phoneRequired");
  }
  if (!data.identityFront || data.identityFront.length === 0) {
    errors.identityFront = t("validation.identityFrontRequired");
  }
  if (!data.identityBack || data.identityBack.length === 0) {
    errors.identityBack = t("validation.identityBackRequired");
  }
  return errors;
};

const BasicInfo = () => {
  const t = useTranslations("RecruitmentPage");
  const dispatch = useDispatch<AppDispatch>();
  const [uploadingCount, setUploadingCount] = useState(0);
  const { mutateAsync: uploadImages } = useUploadImages();
  const { mutateAsync: extractID } = useExtractID();
  const { basicInfo } = useSelector((state: RootState) => state.form);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<BasicInfoFormValues>({
    defaultValues: {
      ...basicInfo,
      identityBack: undefined,
      identityFront: undefined,
    },
    mode: "onChange",
  });

  const onSubmit = (data: BasicInfoFormValues) => {
    if (uploadingCount > 0) {
      toast.error(t("toast.waitForUploads"));
      return;
    }

    const errorsList = validateBasicInfo(data, (key) => t(key));
    if (Object.keys(errorsList).length > 0) return;

    const reduxPayload = {
      ...data,
      identityFront: basicInfo.identityFront,
      identityBack: basicInfo.identityBack,
      identityInfo: basicInfo?.identityInfo || {},
    };
    dispatch(updateBasicInfo(reduxPayload));
    dispatch(nextStep());
  };

  const handleOCRLogic = async (files: File[]) => {
    if (!files.length) return;

    const formData = new FormData();
    formData.append("file", files[0]);

    const res = await extractID(formData);

    if (res?.data) {
      dispatch(
        updateBasicInfo({
          identityInfo: {
            IDNumber: res.data[1],
            fullName: res.data[2],
            dateOfBirth: res.data[3],
            gender: res.data[4],
            nationality: res.data[5],
            placeOfBirth: res.data[6],
          },
        }),
      );
    }
  };

  const handleUploadImage = async (files: File[], name: string) => {
    if (!files.length) {
      return;
    }

    setUploadingCount((prev) => prev + 1);

    try {
      const response = await uploadImages([files[0]]);
      const uploadedImageUrl = response.data.files[0]?.url;

      if (!uploadedImageUrl) {
        throw new Error(t("toast.uploadMissingUrl"));
      }

      dispatch(
        updateBasicInfo({
          [name]: uploadedImageUrl,
        } as Partial<BasicInfoType>),
      );
    } catch (_error) {
      toast.error(t("toast.documentUploadFailed"));
    } finally {
      setUploadingCount((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-3">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="nameRegister"
          control={control}
          rules={{ required: t("validation.nameRequired") }}
          render={({ field }) => (
            <Input
              preIcon={<Icon.User className="main-color-gray w-5 h-5" />}
              label={t("basicInfo.fields.fullName.label")}
              placeholder={t("basicInfo.fields.fullName.placeholder")}
              error={errors.nameRegister?.message}
              {...field}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Controller
            name="email"
            control={control}
            rules={{
              required: t("validation.emailRequired"),
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: t("validation.emailInvalid"),
              },
            }}
            render={({ field }) => (
              <Input
                label={t("basicInfo.fields.email.label")}
                placeholder={t("basicInfo.fields.email.placeholder")}
                preIcon={<Icon.Mail className="main-color-gray w-5 h-5" />}
                error={errors.email?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="phoneNumber"
            control={control}
            rules={{ required: t("validation.phoneRequired") }}
            render={({ field }) => (
              <Input
                label={t("basicInfo.fields.phone.label")}
                placeholder={t("basicInfo.fields.phone.placeholder")}
                preIcon={<Icon.Phone className="main-color-gray w-5 h-5" />}
                error={errors.phoneNumber?.message}
                {...field}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Controller
            name="identityFront"
            control={control}
            rules={{
              required: t("validation.identityFrontRequired"),
              validate: (val) =>
                (val && val.length > 0) ||
                t("validation.identityFrontRequired"),
            }}
            render={({
              field: { onChange, value, ...restField },
              fieldState: { error },
            }) => (
              <Upload
                label={t("basicInfo.fields.identityFront.label")}
                accept="image/jpeg,image/png"
                {...restField}
                value={value || []}
                onChange={(files) => {
                  onChange(files);
                  handleOCRLogic(files);
                  handleUploadImage(files, "identityFront");
                }}
                error={error?.message}
              />
            )}
          />
          <Controller
            name="identityBack"
            control={control}
            rules={{
              required: t("validation.identityBackRequired"),
              validate: (val) =>
                (val && val.length > 0) || t("validation.identityBackRequired"),
            }}
            render={({
              field: { onChange, value, ...restField },
              fieldState: { error },
            }) => (
              <Upload
                label={t("basicInfo.fields.identityBack.label")}
                accept="image/jpeg,image/png"
                {...restField}
                value={value || []}
                onChange={(files) => {
                  onChange(files);
                  handleUploadImage(files, "identityBack");
                }}
                error={error?.message}
              />
            )}
          />
        </div>

        <div className="mt-4 text-sm text-gray-500">
          {t("basicInfo.autoSave")}
        </div>
        <div className="flex justify-between pt-6">
          <CsButton
            className="px-6 py-2 rounded-full"
            type="button"
            icon={<Icon.ArrowLeft className="w-5 h-5" />}
          >
            {t("actions.back")}
          </CsButton>
          <CsButton
            className="cs-bg-black text-white px-6 py-2 rounded-full"
            type="submit"
            loading={uploadingCount > 0}
            disabled={uploadingCount > 0}
          >
            {t("actions.next")}
          </CsButton>
        </div>
      </form>
    </div>
  );
};

export default memo(BasicInfo);
