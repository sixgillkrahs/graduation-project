"use client";

import { Button, Icon, Input } from "@/components/ui";
import { Controller, useForm } from "react-hook-form";

import { useRouter } from "next/navigation";
import { useForgotPassword } from "../services/mutate";
import { setEmail } from "@/store/verify.store";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";

const EmailStep = ({ onNext }: { onNext: () => void }) => {
  const router = useRouter();
  const { mutateAsync: forgotPassword, isPending } = useForgotPassword();
  const { email } = useSelector((state: RootState) => state.verifyOTP);
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IForgotPasswordService.IBodyForgotPassword>({
    defaultValues: {
      email: email,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: IForgotPasswordService.IBodyForgotPassword) => {
    dispatch(setEmail(data.email));
    const resp = await forgotPassword(data);
    if (resp.success) {
      onNext();
    }
  };

  const onBack = () => {
    router.back();
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
        <h2 className="text-2xl font-bold text-black mb-1">Forgot Password</h2>{" "}
        <div className="cs-typography-gray text-sm! max-w-[400px]">
          No worries! Enter your email address below, and we'll send you a code
          to reset your password.
        </div>{" "}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
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
              label="Email"
              placeholder="Enter email"
              error={errors.email?.message}
              type="email"
              suffix={<Icon.Mail className="main-color-gray w-5 h-5" />}
              {...field}
            />
          )}
        />
        <Button
          type="submit"
          className="w-full cs-bg-red text-white"
          loading={isPending}
        >
          Send Code
        </Button>
      </form>
    </div>
  );
};

export default EmailStep;
