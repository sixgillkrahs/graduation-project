"use client";

import { CsButton } from "@/components/custom";
import { Icon } from "@/components/ui";
import { ROUTES } from "@/const/routes";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useCreatePassword } from "./services/mutate";
import { useVerifyEmail } from "./services/query";
import { Password } from "@/components/ui/password";

const VerifyEmail = () => {
  const router = useRouter();
  const { token } = useParams();
  const locale = useLocale();
  const { data, isLoading, isError } = useVerifyEmail(token);
  const { mutateAsync: createPassword, isPending } = useCreatePassword();
  const isVi = locale === "vi";

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<IVerifyEmailService.IBodyVerifyEmail>({
    defaultValues: {
      confirmPassword: "",
      email: "",
      password: "",
      token: (token as string) || "",
    },
    mode: "onChange",
  });

  const password = watch("password");

  useEffect(() => {
    if (data?.data?.email) {
      reset({
        email: data.data.email,
        password: "",
        confirmPassword: "",
        token: token as string,
      });
    }
  }, [data?.data?.email, reset, token]);

  const onSubmit = async (data: IVerifyEmailService.IBodyCreatePassword) => {
    await createPassword(data);
    toast.success(
      isVi
        ? "Mật khẩu đã được tạo thành công"
        : "The password has been successfully created",
    );
    router.push(ROUTES.SIGN_IN);
  };

  if (isError) {
    return (
      <div>
        {isVi ? "Lỗi" : "Error"}: {data?.message}
      </div>
    );
  }

  return (
    <div className="px-10 py-5 h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black">
          {isVi ? "Xác minh email" : "Verify Email"}
        </h2>
        <span className="cs-typography-gray text-sm!">
          {isVi
            ? "Vui lòng đặt mật khẩu để kích hoạt tài khoản."
            : "Please set your password to activate your account."}
        </span>
      </div>

      <div className="h-75">
        {isLoading ? (
          <div>{isVi ? "Đang tải..." : "Loading..."}</div>
        ) : (
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  label="Email"
                  placeholder={isVi ? "Nhập email" : "Enter email"}
                  error={errors.email?.message}
                  disabled
                  suffix={<Icon.Mail className="main-color-gray w-5 h-5" />}
                  {...field}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              rules={{
                required: isVi
                  ? "Mật khẩu là bắt buộc"
                  : "Password is required",
                minLength: {
                  value: 6,
                  message: isVi
                    ? "Mật khẩu phải có ít nhất 6 ký tự"
                    : "Password must be at least 6 characters long",
                },
              }}
              render={({ field }) => (
                <Password
                  label={isVi ? "Mật khẩu" : "Password"}
                  placeholder={isVi ? "Nhập mật khẩu" : "Enter password"}
                  error={errors.password?.message}
                  {...field}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: isVi
                  ? "Xác nhận mật khẩu là bắt buộc"
                  : "Confirm Password is required",
                validate: (value) =>
                  value === password ||
                  (isVi
                    ? "Mật khẩu xác nhận không khớp"
                    : "Passwords do not match"),
              }}
              render={({ field }) => (
                <Password
                  label={isVi ? "Xác nhận mật khẩu" : "Confirm Password"}
                  placeholder={isVi ? "Nhập lại mật khẩu" : "Re-enter password"}
                  error={errors.confirmPassword?.message}
                  {...field}
                />
              )}
            />

            <CsButton
              type="submit"
              className="w-full cs-bg-red text-white mt-2"
              loading={isPending}
            >
              {isVi ? "Xác nhận & Tiếp tục" : "Verify & Continue"}
            </CsButton>
          </form>
        )}
      </div>

      <div className="mt-12 text-center">
        <span className="cs-typography-gray text-sm!">
          {isVi ? "Đã xác minh rồi?" : "Already verified?"}{" "}
          <Link href={ROUTES.SIGN_IN} className="text-red-500">
            {isVi ? "Đăng nhập" : "Sign In"}
          </Link>
        </span>
      </div>
    </div>
  );
};

export default VerifyEmail;
