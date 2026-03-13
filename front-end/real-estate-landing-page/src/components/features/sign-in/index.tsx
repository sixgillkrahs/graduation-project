"use client";

import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import { CsButton } from "@/components/custom";
import { Icon } from "@/components/ui";
import { ROUTES } from "@/const/routes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Password } from "@/components/ui/password";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { startAuthentication } from "@simplewebauthn/browser";
import {
  useSignIn,
  useSignInPasskey,
  useVerifySignInPasskey,
} from "./services/mutate";

const SignIn = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || ROUTES.HOME;
  const authError = searchParams.get("authError");
  const t = useTranslations("SignIn");
  const { mutateAsync: signIn, isPending } = useSignIn();
  const { mutateAsync: signInPasskey } = useSignInPasskey();

  const { mutateAsync: verifySignInPasskey } = useVerifySignInPasskey();

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
    router.push(callbackUrl);
  };

  const onSubmitPasskey = async () => {
    try {
      const res = await signInPasskey({});
      if (res.success) {
        const authRes = await startAuthentication(res.data as any);
        const verifyRes = await verifySignInPasskey({
          response: authRes,
        });
        if (verifyRes.success) {
          router.push(callbackUrl);
        }
      }
    } catch (err: any) {
      if (err?.name !== "NotAllowedError" && err?.name !== "AbortError") {
        console.error("Passkey sign-in error:", err);
      }
    }
  };

  const handleGoogleSignIn = () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      toast.error(t("googleAuthUnavailable"));
      return;
    }

    const normalizedBaseUrl = apiBaseUrl.endsWith("/")
      ? apiBaseUrl.slice(0, -1)
      : apiBaseUrl;
    const googleAuthUrl = new URL(
      `${normalizedBaseUrl}/auth/google`,
    );
    googleAuthUrl.searchParams.set("callbackUrl", callbackUrl);
    googleAuthUrl.searchParams.set("mode", "sign-in");
    window.location.assign(googleAuthUrl.toString());
  };

  useEffect(() => {
    if (authError === "google_auth_failed") {
      toast.error(t("googleAuthFailed"));
    }
  }, [authError, t]);

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-black">{t("welcomeBack")}</h2>
        <span className="cs-typography-gray text-sm!">{t("enterDetails")}</span>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
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
            required: t("passwordRequired"),
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
                {t("rememberMe")}
              </Label>
            )}
          />
          <Link
            className="cs-typography-gray text-sm! cursor-pointer hover:underline"
            href={ROUTES.FORGOT_PASSWORD}
          >
            {t("forgotPassword")}
          </Link>
        </div>
        <CsButton
          type="submit"
          className="w-full cs-bg-red text-white"
          loading={isPending}
        >
          {t("signInBtn")}
        </CsButton>
        <div className="space-y-4">
          <Separator />
          <CsButton
            type="button"
            className="w-full"
            icon={<Icon.Google className="w-5 h-5" />}
            onClick={handleGoogleSignIn}
          >
            {t("continueWithGoogle")}
          </CsButton>
        </div>
        <CsButton
          type="button"
          className="w-full"
          icon={<Icon.Fingerprint className="w-5 h-5" />}
          onClick={onSubmitPasskey}
        >
          {t("signInPasskey")}
        </CsButton>
      </form>
      <div className="mt-4 text-center">
        <span className="cs-typography-gray text-sm!">
          {t("noAccount")}{" "}
          <Link href={ROUTES.SIGN_UP} className="text-red-500">
            {t("signUp")}
          </Link>
        </span>
      </div>
    </>
  );
};

export default SignIn;
