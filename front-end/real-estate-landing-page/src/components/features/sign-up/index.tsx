"use client";

import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import { CsButton } from "@/components/custom";
import { Facebook } from "@/components/ui/Icon/Facebook";
import { Google } from "@/components/ui/Icon/Google";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Password } from "@/components/ui/password";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { useSignUp } from "./services/mutate";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const router = useRouter();
  const { mutateAsync: signUpMutate, isPending } = useSignUp();
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<ISignUpService.IBodySignUp>({
    defaultValues: {
      email: "",
      password: "",
      lastName: "",
      firstName: "",
      phone: "",
      confirmPassword: "",
      verifyPolicy: true,
      roleCode: "USER",
    },
    mode: "onChange",
  });

  const password = watch("password");

  const onSubmit = async (data: ISignUpService.IBodySignUp) => {
    await signUpMutate({
      ...data,
      username: data.email,
    });
    router.push("/sign-in");
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-black">Create an Account</h2>
        <span className="cs-typography-gray text-sm!">
          Join Havenly to save home and contact a real estate agent.
        </span>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="firstName"
            control={control}
            rules={{
              required: "First name is required",
              minLength: {
                value: 3,
                message: "First name must be at least 3 characters",
              },
            }}
            render={({ field }) => (
              <Input
                label="First Name"
                placeholder="John"
                error={errors.firstName?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="lastName"
            control={control}
            rules={{
              required: "Last name is required",
              minLength: {
                value: 3,
                message: "Last name must be at least 3 characters",
              },
            }}
            render={({ field }) => (
              <Input
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...field}
              />
            )}
          />
        </div>
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
              suffix={<Mail className="main-color-gray w-5 h-5" />}
              error={errors.email?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="phone"
          control={control}
          rules={{
            required: "Phone is required",
            pattern: {
              value: /^[0-9]{10,11}$/,
              message: "Please enter a valid phone number",
            },
          }}
          render={({ field }) => (
            <Input
              label="Phone Number"
              placeholder="09012345678"
              suffix={<Phone className="main-color-gray w-5 h-5" />}
              error={errors.phone?.message}
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
              value: 8,
              message: "Password must be at least 8 characters",
            },
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
        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: "Confirm password is required",
            minLength: {
              value: 8,
              message: "Confirm password must be at least 8 characters",
            },
            validate: (value) => value === password || "Passwords do not match",
          }}
          render={({ field }) => (
            <Password
              label="Confirm Password"
              placeholder="Confirm Password"
              error={errors.confirmPassword?.message}
              {...field}
            />
          )}
        />
        <div className="flex justify-between items-center">
          <Controller
            name="verifyPolicy"
            control={control}
            render={({ field }) => (
              <Label>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                I agree to the{" "}
                <Link href="/policy" className="text-red-500">
                  Terms of Service
                </Link>
                and
                <Link href="/policy" className="text-red-500">
                  Privacy Policy
                </Link>
              </Label>
            )}
          />
        </div>
        <CsButton
          type="submit"
          className="w-full cs-bg-red text-white"
          loading={isPending}
        >
          Sign Up
        </CsButton>
      </form>
      <div className="mt-4 text-center">
        <Separator className="my-4" />
        <div className="grid gap-4">
          <div className="flex justify-center items-center gap-4">
            <CsButton icon={<Google className="w-5 h-5" />}></CsButton>
            <CsButton icon={<Facebook className="w-5 h-5" />}></CsButton>
          </div>
          <span className="cs-typography-gray text-sm!">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-red-500">
              Sign In
            </Link>
          </span>
        </div>
        <Separator className="my-4" />
        <span className="cs-typography-gray text-sm!">
          Are you an Agent?{" "}
          <Link href="/work/become-agent/recruitment" className="text-red-500">
            Register here
          </Link>
        </span>
      </div>
    </>
  );
};

export default SignUp;
