"use client";

import { CsButton } from "@/components/custom";
import { Icon } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/Toast";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useCreatePassword } from "./services/mutate";
import { useVerifyEmail } from "./services/query";

const VerifyEmail = () => {
  const router = useRouter();
  const { token } = useParams();
  const { data, isLoading, isError } = useVerifyEmail(token);
  const { mutateAsync: createPassword, isPending } = useCreatePassword();

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
    showToast.success("The password has been successfully created");
    router.push("/sign-in");
  };

  if (isError) {
    return <div>Error: {data?.message}</div>;
  }

  return (
    <div className="px-10 py-5 h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black">Verify Email</h2>
        <span className="cs-typography-gray text-sm!">
          Please set your password to activate your account.
        </span>
      </div>

      <div className="h-75">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  label="Email"
                  placeholder="Enter email"
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
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              }}
              render={({ field }) => (
                <Input
                  label="Password"
                  placeholder="Enter password"
                  type="password"
                  suffix={<Icon.Lock className="main-color-gray w-5 h-5" />}
                  error={errors.password?.message}
                  {...field}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: "Confirm Password is required",
                validate: (value) =>
                  value === password || "Passwords do not match",
              }}
              render={({ field }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Re-enter password"
                  type="password"
                  suffix={<Icon.Lock className="main-color-gray w-5 h-5" />}
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
              Verify & Continue
            </CsButton>
          </form>
        )}
      </div>

      <div className="mt-4 text-center">
        <span className="cs-typography-gray text-sm!">
          Already verified?{" "}
          <Link href="/sign-in" className="text-red-500">
            Sign In
          </Link>
        </span>
      </div>
    </div>
  );
};

export default VerifyEmail;
