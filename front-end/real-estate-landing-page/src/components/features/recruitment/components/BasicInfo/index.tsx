"use client";

import { Button, Icon, Input } from "@/components/ui";
import { AppDispatch, RootState } from "@/store";
import { nextStep, updateBasicInfo } from "@/store/store";
import { memo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

type BasicInfoForm = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

const validateBasicInfo = (data: BasicInfoForm) => {
  const errors: Record<string, string> = {};
  if (!data.fullName) {
    errors.fullName = "Full name is required";
  }
  if (!data.email) {
    errors.email = "Email is required";
  }
  if (!data.phoneNumber) {
    errors.phoneNumber = "Phone number is required";
  }
  return errors;
};

const BasicInfo = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { basicInfo } = useSelector((state: RootState) => state.form);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<BasicInfoForm>({
    defaultValues: basicInfo,
    mode: "onChange",
  });

  const onSubmit = (data: BasicInfoForm) => {
    dispatch(updateBasicInfo(data));
    const errorsList = validateBasicInfo(data);
    if (Object.keys(errorsList).length > 0) {
      return;
    }
    dispatch(nextStep());
  };

  return (
    <div className="flex flex-col gap-4 pt-3">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="fullName"
          control={control}
          rules={{ required: "Full name is required" }}
          render={({ field }) => (
            <Input
              preIcon={<Icon.User className="main-color-gray w-5 h-5" />}
              label="Full Name"
              placeholder="e.g. 123 Main St"
              error={errors.fullName?.message}
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
