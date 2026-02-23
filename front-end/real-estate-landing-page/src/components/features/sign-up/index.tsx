"use client";

import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import { CsButton } from "@/components/custom";
import { Facebook } from "@/components/ui/Icon/Facebook";
import { Google } from "@/components/ui/Icon/Google";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Password } from "@/components/ui/password";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/const/routes";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useSignUp } from "./services/mutate";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const router = useRouter();
  const t = useTranslations("SignUp");
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
    router.push(ROUTES.SIGN_IN);
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-black">{t("createAccount")}</h2>
        <span className="cs-typography-gray text-sm!">
          {t("joinDescription")}
        </span>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="firstName"
            control={control}
            rules={{
              required: t("firstNameRequired"),
              minLength: {
                value: 3,
                message: t("firstNameMin"),
              },
            }}
            render={({ field }) => (
              <Input
                label={t("firstName")}
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
              required: t("lastNameRequired"),
              minLength: {
                value: 3,
                message: t("lastNameMin"),
              },
            }}
            render={({ field }) => (
              <Input
                label={t("lastName")}
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
            required: t("emailRequired"),
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: t("emailInvalid"),
            },
          }}
          render={({ field }) => (
            <Input
              label={t("emailLabel")}
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
            required: t("phoneRequired"),
            pattern: {
              value: /^[0-9]{10,11}$/,
              message: t("phoneInvalid"),
            },
          }}
          render={({ field }) => (
            <Input
              label={t("phoneLabel")}
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
            required: t("passwordRequired"),
            minLength: {
              value: 8,
              message: t("passwordMin"),
            },
          }}
          render={({ field }) => (
            <Password
              label={t("passwordLabel")}
              placeholder={t("passwordLabel")}
              error={errors.password?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: t("confirmPasswordRequired"),
            minLength: {
              value: 8,
              message: t("confirmPasswordMin"),
            },
            validate: (value) => value === password || t("passwordMismatch"),
          }}
          render={({ field }) => (
            <Password
              label={t("confirmPasswordLabel")}
              placeholder={t("confirmPasswordLabel")}
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
                {t("agreePolicy")}{" "}
                <Link href={ROUTES.POLICY} className="text-red-500">
                  {t("termsOfService")}
                </Link>{" "}
                {t("and")}{" "}
                <Link href={ROUTES.POLICY} className="text-red-500">
                  {t("privacyPolicy")}
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
          {t("signUpBtn")}
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
            {t("alreadyHaveAccount")}{" "}
            <Link href={ROUTES.SIGN_IN} className="text-red-500">
              {t("signIn")}
            </Link>
          </span>
        </div>
        <Separator className="my-4" />
        <span className="cs-typography-gray text-sm!">
          {t("areYouAgent")}{" "}
          <Link href={ROUTES.RECRUITMENT} className="text-red-500">
            {t("registerHere")}
          </Link>
        </span>
      </div>
    </>
  );
};

export default SignUp;
