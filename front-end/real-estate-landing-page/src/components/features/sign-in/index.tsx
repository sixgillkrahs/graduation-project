"use client";

import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import { CsButton } from "@/components/custom";
import { Icon } from "@/components/ui";
import { ROUTES } from "@/const/routes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Password } from "@/components/ui/password";
import { Separator } from "@/components/ui/separator";
import AuthService from "@/shared/auth/AuthService";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import SmartkeyPrompt from "./components/SmartkeyPrompt";
import {
  useRegisterPasskeyAfterLogin,
  useVerifyPasskeyAfterLogin,
} from "./services/passkey";
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
  const registerPasskeyAfterLoginMutation = useRegisterPasskeyAfterLogin();
  const verifyPasskeyAfterLoginMutation = useVerifyPasskeyAfterLogin();
  const { mutateAsync: registerPasskeyAfterLogin } =
    registerPasskeyAfterLoginMutation;
  const { mutateAsync: verifyPasskeyAfterLogin } =
    verifyPasskeyAfterLoginMutation;
  const [isSmartkeyPromptOpen, setIsSmartkeyPromptOpen] = useState(false);
  const [smartkeyError, setSmartkeyError] = useState<string | null>(null);

  const canUseSmartkey = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.isSecureContext &&
      "PublicKeyCredential" in window,
    [],
  );

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

    try {
      const me = await AuthService.getMe();
      const hasRegisteredSmartkey = Boolean(me?.data?.passkeys?.length);

      if (!hasRegisteredSmartkey) {
        setSmartkeyError(null);
        setIsSmartkeyPromptOpen(true);
        return;
      }
    } catch (_error) {
      // Fall back to the existing redirect if the profile check fails.
    }

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
    const googleAuthUrl = new URL(`${normalizedBaseUrl}/auth/google`);
    googleAuthUrl.searchParams.set("callbackUrl", callbackUrl);
    googleAuthUrl.searchParams.set("mode", "sign-in");
    window.location.assign(googleAuthUrl.toString());
  };

  useEffect(() => {
    if (authError === "google_auth_failed") {
      toast.error(t("googleAuthFailed"));
    }
  }, [authError, t]);

  const handleSkipSmartkeyRegistration = () => {
    setSmartkeyError(null);
    setIsSmartkeyPromptOpen(false);
    router.push(callbackUrl);
  };

  const handleRegisterSmartkey = async () => {
    if (!canUseSmartkey) {
      setSmartkeyError(t("smartkey.unsupportedDescription"));
      return;
    }

    setSmartkeyError(null);

    try {
      const options = await registerPasskeyAfterLogin();

      if (!options.success) {
        throw new Error("Failed to initialize smartkey registration");
      }

      const credential = await startRegistration(options.data as any);
      const verification = await verifyPasskeyAfterLogin(credential);

      if (!verification.success) {
        throw new Error("Failed to verify smartkey registration");
      }

      setIsSmartkeyPromptOpen(false);
      toast.success(t("smartkey.registerSuccess"));
      router.push(callbackUrl);
    } catch (err: any) {
      if (err?.name !== "NotAllowedError" && err?.name !== "AbortError") {
        console.error("Passkey registration error:", err);
        setSmartkeyError(t("smartkey.registerFailed"));
        toast.error(t("smartkey.registerFailed"));
      }
    }
  };

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
              autoComplete="email"
              inputMode="email"
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
              autoComplete="current-password"
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
          <div className="flex justify-center gap-4">
            <CsButton
              type="button"
              icon={<Icon.Google className="w-5 h-5" />}
              onClick={handleGoogleSignIn}
            ></CsButton>
            <CsButton
              type="button"
              icon={<Icon.Facebook className="w-5 h-5" />}
              onClick={handleGoogleSignIn}
            ></CsButton>
            <CsButton
              type="button"
              icon={<Icon.Fingerprint className="w-5 h-5" />}
              onClick={onSubmitPasskey}
            ></CsButton>
          </div>
        </div>
      </form>
      <div className="mt-4 text-center">
        <span className="cs-typography-gray text-sm!">
          {t("noAccount")}{" "}
          <Link href={ROUTES.SIGN_UP} className="text-red-500">
            {t("signUp")}
          </Link>
        </span>
      </div>
      <SmartkeyPrompt
        open={isSmartkeyPromptOpen}
        isSupported={canUseSmartkey}
        isLoading={
          registerPasskeyAfterLoginMutation.isPending ||
          verifyPasskeyAfterLoginMutation.isPending
        }
        errorMessage={smartkeyError}
        onRegister={() => {
          void handleRegisterSmartkey();
        }}
        onSkip={handleSkipSmartkeyRegistration}
      />
    </>
  );
};

export default SignIn;
