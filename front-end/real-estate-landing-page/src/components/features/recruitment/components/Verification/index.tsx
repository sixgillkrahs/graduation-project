"use client";

import { Button, Checkbox, Icon, Input, Select } from "@/components/ui";
import {
  BusinessInfo,
  Verification as VerificationType,
} from "@/models/basicInfo.model";
import { AppDispatch, RootState } from "@/store";
import {
  prevStep,
  updateBusinessInfo,
  updateVerification,
} from "@/store/store";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import ExtractService from "../../services/service";
import { memo, useEffect } from "react";
import { submitForm } from "@/store/thunks/formThunks";
import { showToast } from "@/components/ui/Toast";

const Verification = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { businessInfo, verification, isSubmitting } = useSelector(
    (state: RootState) => state.form
  );

  const {
    control,
    reset,
    formState: { errors },
  } = useForm<BusinessInfo & VerificationType>({
    defaultValues: {
      ...businessInfo,
      ...verification,
    },
    mode: "onChange",
  });

  useEffect(() => {
    reset({
      ...businessInfo,
      ...verification,
    });
  }, [businessInfo, verification, reset]);

  const handlePrev = () => {
    dispatch(prevStep());
  };

  const handleSubmitData = async () => {
    try {
      await dispatch(submitForm()).unwrap();
      showToast.success("Đăng ký thành công", "Cảm ơn bạn đã đăng ký!");
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };

  return (
    <form>
      <div className="grid grid-cols-2 gap-4 my-4 ">
        <Controller
          name="agentName"
          control={control}
          rules={{
            required: "Agent name is required",
            minLength: {
              value: 2,
              message: "Agent name must be at least 2 characters",
            },
          }}
          render={({ field }) => (
            <Input
              label="Full Name"
              placeholder="e.g. John Doe"
              error={errors.agentName?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="IDNumber"
          control={control}
          rules={{
            required: "ID Number is required",
            minLength: {
              value: 12,
              message: "ID Number must be 12 characters",
            },
          }}
          render={({ field }) => (
            <Input
              label="ID Number"
              placeholder="e.g. 124xxxxxxxx"
              error={errors.IDNumber?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="gender"
          control={control}
          rules={{ required: "Please select gender" }}
          render={({ field }) => (
            <Select
              label="Gender"
              placeholder="Select gender"
              options={ExtractService.options}
              error={errors.gender?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="dateOfBirth"
          control={control}
          rules={{ required: "Birthday is required" }}
          render={({ field }) => (
            <Input
              label="Birthday"
              placeholder="e.g. 01/01/2000"
              error={errors.dateOfBirth?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="nationality"
          control={control}
          rules={{ required: "Nationality is required" }}
          render={({ field }) => (
            <Input
              label="Nationality"
              placeholder="e.g. Vietnamese"
              error={errors.nationality?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="address"
          control={control}
          rules={{ required: "Address is required" }}
          render={({ field }) => (
            <Input
              label="Address"
              placeholder="e.g. 123 Main St"
              error={errors.address?.message}
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
            required:
              "You must agree to the Terms and Conditions and Privacy Policy",
          }}
          render={({ field: { value, onChange, ...restField } }) => (
            <Checkbox
              label="I agree to the Terms and Conditions and Privacy Policy"
              subtext="I certify that all information I have provided is true and correct..."
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
        <Button
          className="text-black px-6 py-2 rounded-full"
          onClick={handlePrev}
          type="button"
          icon={<Icon.ArrowLeft className="w-5 h-5" />}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          className="cs-bg-black text-white px-6 py-2 rounded-full"
          onClick={handleSubmitData}
          disabled={isSubmitting}
          // loading={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  );
};

export default memo(Verification);
