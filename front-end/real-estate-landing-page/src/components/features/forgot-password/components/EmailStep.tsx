"use client";

import { Icon } from "@/components/ui";
import { Controller, useForm } from "react-hook-form";

import { useRouter } from "next/navigation";
import { useForgotPassword } from "../services/mutate";
import { setEmail } from "@/store/verify.store";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { CsButton } from "@/components/custom";
import { Input } from "@/components/ui/input";
import { useLocale } from "next-intl";

const EmailStep = ({ onNext }: { onNext: () => void }) => {
  const router = useRouter();
  const locale = useLocale();
  const { mutateAsync: forgotPassword, isPending } = useForgotPassword();
  const { email } = useSelector((state: RootState) => state.verifyOTP);
  const dispatch = useDispatch();
  const isVi = locale === "vi";

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
        {isVi ? "Quay lại" : "Back"}
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-1">
          {isVi ? "Quên mật khẩu" : "Forgot Password"}
        </h2>{" "}
        <div className="cs-typography-gray text-sm! max-w-[400px]">
          {isVi
            ? "Đừng lo. Nhập email bên dưới, chúng tôi sẽ gửi mã để bạn đặt lại mật khẩu."
            : "No worries! Enter your email address below, and we'll send you a code to reset your password."}
        </div>{" "}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <Controller
          name="email"
          control={control}
          rules={{
            required: isVi ? "Email là bắt buộc" : "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: isVi
                ? "Vui lòng nhập địa chỉ email hợp lệ"
                : "Please enter a valid email address",
            },
          }}
          render={({ field }) => (
            <Input
              label="Email"
              placeholder={isVi ? "Nhập email" : "Enter email"}
              error={errors.email?.message}
              type="email"
              suffix={<Icon.Mail className="main-color-gray w-5 h-5" />}
              {...field}
            />
          )}
        />
        <CsButton
          type="submit"
          className="w-full cs-bg-red text-white"
          loading={isPending}
        >
          {isVi ? "Gửi mã" : "Send Code"}
        </CsButton>
      </form>
    </div>
  );
};

export default EmailStep;
