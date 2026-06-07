"use client";

import { CsButton } from "@/components/custom";
import { CsDialog } from "@/components/custom/dialog";
import { useTranslations } from "next-intl";

interface SmartkeyPromptProps {
  open: boolean;
  isSupported: boolean;
  isLoading: boolean;
  errorMessage?: string | null;
  onSkip: () => void;
  onRegister: () => void;
}

const SmartkeyPrompt = ({
  open,
  isSupported,
  isLoading,
  errorMessage,
  onSkip,
  onRegister,
}: SmartkeyPromptProps) => {
  const t = useTranslations("SignIn.smartkey");

  return (
    <CsDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onSkip();
        }
      }}
      title={t("title")}
      cancelText={t("skip")}
      loading={isLoading}
      footer={
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <CsButton
            type="button"
            onClick={onSkip}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            {t("skip")}
          </CsButton>
          {isSupported && (
            <CsButton
              type="button"
              onClick={onRegister}
              loading={isLoading}
              className="cs-bg-red w-full text-white sm:w-auto"
            >
              {t("registerNow")}
            </CsButton>
          )}
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-sm leading-6 text-gray-600">
          {isSupported ? t("description") : t("unsupportedDescription")}
        </p>
        <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
          {isSupported ? t("benefit") : t("unsupportedHelp")}
        </div>
        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </CsDialog>
  );
};

export default SmartkeyPrompt;
