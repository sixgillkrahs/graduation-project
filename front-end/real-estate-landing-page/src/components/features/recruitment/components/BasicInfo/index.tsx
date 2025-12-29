"use client";

import { Button, Icon, Input, Upload } from "@/components/ui";
import { AppDispatch, RootState } from "@/store";
import { nextStep, updateBasicInfo } from "@/store/store";
import { memo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useExtractID, useUploadImage } from "../../services/mutation";
import { BasicInfo as BasicInfoType } from "@/models/basicInfo.model";

const validateBasicInfo = (data: BasicInfoType) => {
  const errors: Record<string, string> = {};
  if (!data.nameRegister) {
    errors.nameRegister = "Name register is required";
  }
  if (!data.email) {
    errors.email = "Email is required";
  }
  if (!data.phoneNumber) {
    errors.phoneNumber = "Phone number is required";
  }
  if (!data.identityFront || data.identityFront.length === 0) {
    errors.identityFront = "Identity front is required";
  }
  if (!data.identityBack || data.identityBack.length === 0) {
    errors.identityBack = "Identity back is required";
  }
  return errors;
};

const BasicInfo = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { mutateAsync: uploadImage } = useUploadImage();
  const { mutateAsync: extractID } = useExtractID();
  const { basicInfo } = useSelector((state: RootState) => state.form);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<BasicInfoType & { identityFront: File[]; identityBack: File[] }>({
    defaultValues: {
      ...basicInfo,
      identityBack: [],
      identityFront: [],
    },
    mode: "onChange",
  });

  const onSubmit = (
    data: BasicInfoType & { identityFront: File[]; identityBack: File[] }
  ) => {
    const errorsList = validateBasicInfo(data);
    if (Object.keys(errorsList).length > 0) return;

    const reduxPayload = {
      ...data,
      identityFront: basicInfo.identityFront,
      identityBack: basicInfo.identityBack,
      identityInfo: basicInfo?.identityInfo || {},
    };
    console.log(reduxPayload);
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
        })
      );
    }
  };

  const handleUploadImage = async (files: File[], name: string) => {
    const formData = new FormData();
    if (files.length > 0) {
      formData.append("file", files[0]);
      const resp = await uploadImage(formData);
      if (resp && resp.success) {
        dispatch(
          updateBasicInfo({
            [name]: resp.filename,
          })
        );
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-3">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="nameRegister"
          control={control}
          rules={{ required: "Full name is required" }}
          render={({ field }) => (
            <Input
              preIcon={<Icon.User className="main-color-gray w-5 h-5" />}
              label="Full Name"
              placeholder="e.g. 123 Main St"
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
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Please enter a valid email address",
              },
            }}
            render={({ field }) => (
              <Input
                label="Email Address"
                placeholder="john.doe@example.com"
                preIcon={<Icon.Mail className="main-color-gray w-5 h-5" />}
                error={errors.email?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="phoneNumber"
            control={control}
            rules={{ required: "Phone number is required" }}
            render={({ field }) => (
              <Input
                label="Phone Number"
                placeholder="0123456789"
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
              required: "Identity front is required",
              validate: (val) =>
                (val && val.length > 0) || "Identity front is required",
            }}
            render={({
              field: { onChange, value, ...restField },
              fieldState: { error },
            }) => (
              <Upload
                label="Identity Front"
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
              required: "Identity back is required",
              validate: (val) =>
                (val && val.length > 0) || "Identity back is required",
            }}
            render={({
              field: { onChange, value, ...restField },
              fieldState: { error },
            }) => (
              <Upload
                label="Identity Back"
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
          Your information is automatically saved as you type.
        </div>
        <div className="flex justify-between pt-6">
          <Button
            className="text-black px-6 py-2 rounded-full"
            // onClick={handlePrev}
            type="button"
            icon={<Icon.ArrowLeft className="w-5 h-5" />}
            // disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            className="cs-bg-black text-white px-6 py-2 rounded-full"
            type="submit"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default memo(BasicInfo);
