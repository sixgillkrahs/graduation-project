"use client";

import Image from "next/image";
import Logo from "@/assets/Logo.svg";
import { Controller, useForm } from "react-hook-form";
import { Button, Checkbox, Icon, Input } from "@/components/ui";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn, useSignInPasskey } from "./services/mutate";

const SignIn = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: signIn, isPending } = useSignIn();
  const { mutateAsync: signInPasskey, isPending: isPendingPasskey } =
    useSignInPasskey();

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<{
    email: string;
    password: string;
    rememberMe: boolean;
  }>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    await signIn({
      username: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });
    router.push("/");
  };

  const handleToHome = () => {
    router.push("/");
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmitPasskey = async () => {
    await signInPasskey({ email: "dvq2804@gmail.com" });
    router.push("/");
  };

  return (
    <div className="px-10 py-5 h-full">
      <div
        className="flex items-start gap-2 text-xl md:text-2xl font-semibold cursor-pointer mb-6"
        onClick={handleToHome}
      >
        <Image src={Logo} alt="logo" width={24} height={24} />
        <span className="text-black">Havenly</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-black">Welcome Back</h2>
        <span className="cs-typography-gray text-sm!">
          Please enter your details.
        </span>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4">
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
              suffix={<Icon.Mail className="main-color-gray w-5 h-5" />}
              error={errors.email?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          rules={{
            required: "Password is required",
          }}
          render={({ field }) => (
            <Input
              label="Password"
              placeholder="Password"
              suffix={
                showPassword ? (
                  <Icon.Eye
                    className="main-color-gray w-5 h-5 cursor-pointer"
                    onClick={handleTogglePassword}
                  />
                ) : (
                  <Icon.EyeClose
                    className="main-color-gray w-5 h-5 cursor-pointer"
                    onClick={handleTogglePassword}
                  />
                )
              }
              type={showPassword ? "text" : "password"}
              error={errors.password?.message}
              {...field}
            />
          )}
        />
        <div className="flex justify-between items-center">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field: { value, onChange, ...restField } }) => (
              <Checkbox
                label="Remember me"
                checked={value}
                {...restField}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  onChange(isChecked);
                }}
              />
            )}
          />
          <Link
            className="cs-typography-gray text-sm! cursor-pointer hover:underline"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          className="w-full cs-bg-red text-white"
          loading={isPending}
        >
          Sign In
        </Button>
        <Button
          type="button"
          className="w-full "
          outline
          icon={<Icon.Fingerprint className="w-5 h-5" />}
          onClick={onSubmitPasskey}
        >
          Sign In with Passkey
        </Button>
      </form>
      <div className="mt-4 text-center">
        <span className="cs-typography-gray text-sm!">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-red-500">
            Sign Up
          </Link>
        </span>
      </div>
    </div>
  );
};

export default SignIn;
