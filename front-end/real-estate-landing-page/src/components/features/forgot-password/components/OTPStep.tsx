"use client";

import { Button, Icon, OTP } from "@/components/ui";
import { Controller, useForm } from "react-hook-form";
import { useVerifyOTP } from "../services/mutate";

const OTPStep = ({ onBack, email }: { onBack: () => void; email: string }) => {
  const { mutateAsync: verifyOTP, isPending } = useVerifyOTP();
  const {
    control,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<IForgotPasswordService.IBodyVerifyOTP>({
    defaultValues: {
      otp: "",
      email,
    },
    mode: "onChange",
  });

  const otpValue = watch("otp");

  const onSubmit = async (data: IForgotPasswordService.IBodyVerifyOTP) => {
    await verifyOTP(data);
  };

  return (
    <div className="w-full px-2">
      <div
        className="flex gap-2 items-center cursor-pointer  mb-6"
        onClick={onBack}
      >
        <Icon.ArrowLeft className="main-color-gray w-5 h-5" />
        Back
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-1">
          We've sent you a code
        </h2>

        <div className="cs-typography-gray text-sm! max-w-[400px]">
          Enter the code we sent to{" "}
          <span className="font-medium text-black">{email}</span> to reset your
          password.
        </div>
      </div>
      <form className="space-y-10" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="otp"
          control={control}
          rules={{
            required: "OTP is required",
            minLength: {
              value: 6,
              message: "OTP must be 6 characters",
            },
          }}
          render={({ field, fieldState }) => (
            <OTP
              length={6}
              value={otpValue}
              onValueChange={(val) =>
                setValue("otp", val, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              error={fieldState.error?.message}
            />
          )}
        />
        <Button type="submit" className="w-full cs-bg-red text-white mt-2">
          Reset Password
        </Button>
      </form>
    </div>
  );
};

export default OTPStep;
