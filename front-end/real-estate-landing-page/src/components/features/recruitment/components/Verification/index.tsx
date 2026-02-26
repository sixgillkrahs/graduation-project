"use client";

import { CsButton } from "@/components/custom";
import { Checkbox, Icon } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { CsSelect } from "@/components/ui/select";
import {
  BasicInfo,
  Verification as VerificationType,
} from "@/models/basicInfo.model";
import { AppDispatch, RootState } from "@/store";
import { prevStep, updateVerification } from "@/store/store";
import { submitForm } from "@/store/thunks/formThunks";
import { memo, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import ExtractService from "../../services/service";

const Verification = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { basicInfo, verification, businessInfo, isSubmitting } = useSelector(
    (state: RootState) => state.form,
  );
  console.log(businessInfo);
  const {
    control,
    reset,
    formState: { errors },
  } = useForm<BasicInfo & VerificationType>({
    defaultValues: {
      ...basicInfo,
      ...verification,
    },
    mode: "onChange",
  });

  console.log(basicInfo);

  useEffect(() => {
    reset({
      ...basicInfo,
      ...verification,
    });
  }, [basicInfo, verification, reset]);

  const handlePrev = () => {
    dispatch(prevStep());
  };

  const handleSubmitData = async () => {
    try {
      await dispatch(submitForm()).unwrap();
      toast.success("Đăng ký thành công", { position: "top-center" });
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
              error={errors.identityInfo?.fullName?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="identityInfo.IDNumber"
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
              error={errors.identityInfo?.IDNumber?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="identityInfo.gender"
          control={control}
          rules={{ required: "Please select gender" }}
          render={({ field }) => (
            <CsSelect
              label="Gender"
              placeholder="Select gender"
              options={ExtractService.options}
              error={errors.identityInfo?.gender?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="identityInfo.dateOfBirth"
          control={control}
          rules={{ required: "Birthday is required" }}
          render={({ field }) => (
            <Input
              label="Birthday"
              placeholder="e.g. 01/01/2000"
              error={errors.identityInfo?.dateOfBirth?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="identityInfo.nationality"
          control={control}
          rules={{ required: "Nationality is required" }}
          render={({ field }) => (
            <Input
              label="Nationality"
              placeholder="e.g. Vietnamese"
              error={errors.identityInfo?.nationality?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="identityInfo.placeOfBirth"
          control={control}
          rules={{ required: "Address is required" }}
          render={({ field }) => (
            <Input
              label="Address"
              placeholder="e.g. 123 Main St"
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
        <CsButton
          className="px-6 py-2 rounded-full"
          onClick={handlePrev}
          type="button"
          icon={<Icon.ArrowLeft className="w-5 h-5" />}
          disabled={isSubmitting}
        >
          Back
        </CsButton>
        <CsButton
          className="cs-bg-black text-white px-6 py-2 rounded-full"
          onClick={handleSubmitData}
          disabled={isSubmitting}
          // loading={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </CsButton>
      </div>
    </form>
  );
};

export default memo(Verification);
