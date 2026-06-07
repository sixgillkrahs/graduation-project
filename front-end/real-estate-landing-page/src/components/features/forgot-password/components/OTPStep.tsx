"use client";

import { CsButton } from "@/components/custom";
import { Icon } from "@/components/ui";
import { OTP } from "@/components/ui/input-otp";
import { RootState } from "@/store";
import { setToken } from "@/store/verify.store";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useVerifyOTP } from "../services/mutate";
import { useLocale } from "next-intl";
import Timer from "./Timer";

const OTPStep = ({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) => {
  const { mutateAsync: verifyOTP, isPending } = useVerifyOTP();
  const { email } = useSelector((state: RootState) => state.verifyOTP);
  const dispatch = useDispatch();
  const locale = useLocale();
  const isVi = locale === "vi";
  const { control, handleSubmit } =
    useForm<IForgotPasswordService.IBodyVerifyOTP>({
      defaultValues: {
        otp: "",
        email,
      },
      mode: "onChange",
    });
  const onSubmit = async (data: IForgotPasswordService.IBodyVerifyOTP) => {
    const resp = await verifyOTP(data);
    if (resp.success) {
      console.log(resp.data.token);
      dispatch(setToken(resp.data.token));
      onNext();
    }
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
          {isVi ? "Chúng tôi đã gửi mã cho bạn" : "We've sent you a code"}
        </h2>

        <div className="cs-typography-gray text-sm! max-w-[400px]">
          {isVi ? (
            <>
              Nhập mã đã gửi đến{" "}
              <span className="font-medium text-black">{email}</span> để đặt lại
              mật khẩu.
            </>
          ) : (
            <>
              Enter the code we sent to{" "}
              <span className="font-medium text-black">{email}</span> to reset
              your password.
            </>
          )}
        </div>
      </div>
      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="otp"
          control={control}
          rules={{
            required: isVi ? "OTP là bắt buộc" : "OTP is required",
            minLength: {
              value: 6,
              message: isVi
                ? "OTP phải đủ 6 ký tự"
                : "OTP must be 6 characters",
            },
          }}
          render={({ field, fieldState }) => (
            <OTP
              maxLength={6}
              error={fieldState.error?.message}
              {...field}
              pattern="digitals"
              disabled={isPending}
              containerClassName="justify-center"
            />
          )}
        />
        <CsButton
          type="submit"
          className="w-full cs-bg-red text-white mt-2"
          loading={isPending}
        >
          {isVi ? "Xác nhận mã" : "Verify Code"}
        </CsButton>
      </form>
      <Timer email={email} />
    </div>
  );
};

export default OTPStep;
