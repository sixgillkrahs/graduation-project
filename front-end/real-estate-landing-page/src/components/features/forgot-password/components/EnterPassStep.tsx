import { Icon } from "@/components/ui";
import { RootState } from "@/store";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useResetPassword } from "../services/mutate";
import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/const/routes";
import { CsButton } from "@/components/custom";
import { Password } from "@/components/ui/password";
import { useLocale } from "next-intl";

const EnterPassStep = ({ onBack }: { onBack: () => void }) => {
  const { token } = useSelector((state: RootState) => state.verifyOTP);
  const { mutateAsync: resetPassword, isPending } = useResetPassword();
  const [isSuccess, setIsSuccess] = useState(false);
  const locale = useLocale();
  const isVi = locale === "vi";

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<IForgotPasswordService.IBodyResetPassword>({
    defaultValues: {
      token: token,
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: IForgotPasswordService.IBodyResetPassword) => {
    const resp = await resetPassword(data);
    if (resp.success) {
      setIsSuccess(true);
    }
  };

  return (
    <div className="w-full px-2">
      <div
        className="flex gap-2 items-center cursor-pointer mb-6"
        onClick={onBack}
      >
        <Icon.ArrowLeft className="main-color-gray w-5 h-5" />
        {isVi ? "Quay lại" : "Back"}
      </div>

      {isSuccess ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-500">
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20 duration-1000"></div>
            <div className="relative w-24 h-24 bg-green-50 rounded-full flex items-center justify-center border border-green-100 shadow-sm">
              <Icon.CheckMark className="w-10 h-10 text-emerald-600" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            {isVi
              ? "Đặt lại mật khẩu thành công!"
              : "Password Reset Successful!"}
          </h2>

          <div className="max-w-md mx-auto space-y-2 text-gray-500 mb-8">
            <p>
              {isVi
                ? "Mật khẩu của bạn đã được cập nhật thành công."
                : "Your password has been updated successfully."}
            </p>
            <p className="text-sm">
              {isVi ? (
                <>
                  Bây giờ bạn có thể đăng nhập bằng{" "}
                  <span className="font-medium text-gray-900">
                    mật khẩu mới
                  </span>
                  .
                </>
              ) : (
                <>
                  You can now sign in using your{" "}
                  <span className="font-medium text-gray-900">
                    new password
                  </span>
                  .
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href={ROUTES.SIGN_IN}
              className="
            px-8 py-3 rounded-full
            bg-black text-white font-medium text-sm
            hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl
            active:scale-95
            flex items-center justify-center
          "
            >
              {isVi ? "Quay lại đăng nhập" : "Back to Login"}
            </Link>

            <Link
              href={ROUTES.HOME}
              className="
            px-8 py-3 rounded-full
            border border-gray-200 text-gray-600 font-medium text-sm
            hover:bg-gray-50 hover:text-black transition-all
            flex items-center justify-center
          "
            >
              {isVi ? "Về trang chủ" : "Go to Home Page"}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-black mb-1">
              {isVi ? "Đặt lại mật khẩu" : "Reset your password"}
            </h2>
            <p className="cs-typography-gray text-sm!">
              {isVi
                ? "Nhập mật khẩu mới cho tài khoản của bạn."
                : "Enter a new password for your account."}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="password"
              control={control}
              rules={{
                required: isVi
                  ? "Mật khẩu là bắt buộc"
                  : "Password is required",
                minLength: {
                  value: 8,
                  message: isVi
                    ? "Mật khẩu phải có ít nhất 8 ký tự"
                    : "Password must be at least 8 characters",
                },
              }}
              render={({ field }) => (
                <Password
                  {...field}
                  label={isVi ? "Mật khẩu mới" : "New password"}
                  placeholder={
                    isVi ? "Nhập mật khẩu mới" : "Enter new password"
                  }
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: isVi
                  ? "Xác nhận mật khẩu là bắt buộc"
                  : "Confirm password is required",
                validate: (val) =>
                  val === watch("password") ||
                  (isVi
                    ? "Mật khẩu xác nhận không khớp"
                    : "Passwords do not match"),
              }}
              render={({ field }) => (
                <Password
                  {...field}
                  label={isVi ? "Xác nhận mật khẩu" : "Confirm password"}
                  placeholder={
                    isVi ? "Nhập lại mật khẩu mới" : "Re-enter new password"
                  }
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <CsButton
              type="submit"
              className="w-full cs-bg-red text-white mt-4"
              loading={isPending}
            >
              {isVi ? "Đặt lại mật khẩu" : "Reset Password"}
            </CsButton>
          </form>
        </>
      )}
    </div>
  );
};

export default EnterPassStep;
