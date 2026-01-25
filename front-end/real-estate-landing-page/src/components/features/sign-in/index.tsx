"use client";

import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import { CsButton } from "@/components/custom";
import { Icon } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Password } from "@/components/ui/password";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { useSignIn, useSignInPasskey } from "./services/mutate";

const SignIn = () => {
  const router = useRouter();
  const { mutateAsync: signIn, isPending } = useSignIn();
  const { mutateAsync: signInPasskey, isPending: isPendingPasskey } =
    useSignInPasskey();

  const {
    handleSubmit,
    control,
    formState: { errors },
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

  const onSubmitPasskey = async () => {
    await signInPasskey({ email: "dvq2804@gmail.com" });
    router.push("/");
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-black">Welcome Back</h2>
        <span className="cs-typography-gray text-sm!">
          Please enter your details.
        </span>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
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
            <Password
              label="Password"
              placeholder="Password"
              error={errors.password?.message}
              {...field}
            />
          )}
        />
        <div className="flex justify-between items-center">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <Label>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                Remember me
              </Label>
            )}
          />
          <Link
            className="cs-typography-gray text-sm! cursor-pointer hover:underline"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
        <CsButton
          type="submit"
          className="w-full cs-bg-red text-white"
          loading={isPending}
        >
          Sign In
        </CsButton>
        <CsButton
          type="button"
          className="w-full"
          icon={<Icon.Fingerprint className="w-5 h-5" />}
          onClick={onSubmitPasskey}
        >
          Sign In with Passkey
        </CsButton>
      </form>
      <div className="mt-4 text-center">
        <span className="cs-typography-gray text-sm!">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-red-500">
            Sign Up
          </Link>
        </span>
      </div>
    </>
  );
};

export default SignIn;
