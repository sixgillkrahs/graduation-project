"use client";

import { Flag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { CsButton } from "@/components/custom";
import { CsDialog } from "@/components/custom/dialog";
import { CsSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch } from "@/lib/hooks";
import { showAuthDialog } from "@/store/auth-dialog.store";
import { useCreateReport } from "../services/mutate";

interface ReportEntityButtonProps {
  targetType: IReportService.ReportTargetType;
  targetId: string;
  isLoggedIn: boolean;
  redirectUrl: string;
  buttonLabel?: string;
  className?: string;
  variant?: React.ComponentProps<typeof CsButton>["variant"];
}

const ReportEntityButton = ({
  targetType,
  targetId,
  isLoggedIn,
  redirectUrl,
  buttonLabel,
  className,
  variant = "outline",
}: ReportEntityButtonProps) => {
  const t = useTranslations("ReportDialog");
  const dispatch = useAppDispatch();
  const { mutateAsync: createReport, isPending } = useCreateReport();
  const [open, setOpen] = useState(false);
  const [reason, setReason] =
    useState<IReportService.ReportReason>("WRONG_DATA");
  const [details, setDetails] = useState("");

  const targetKey = targetType === "LISTING" ? "listing" : "agent";

  const reasonOptions = useMemo(
    () => [
      { value: "WRONG_DATA", label: t("reasons.wrongData") },
      { value: "SPAM", label: t("reasons.spam") },
      { value: "FAKE_PRICE", label: t("reasons.fakePrice") },
      { value: "OTHER", label: t("reasons.other") },
    ],
    [t],
  );

  useEffect(() => {
    if (open) {
      return;
    }

    setReason("WRONG_DATA");
    setDetails("");
  }, [open]);

  const handleOpen = () => {
    if (!isLoggedIn) {
      dispatch(
        showAuthDialog({
          title: t(`auth.${targetKey}.title`),
          description: t(`auth.${targetKey}.description`),
          redirectUrl,
        }),
      );
      return;
    }

    setOpen(true);
  };

  const handleSubmit = async () => {
    await createReport({
      targetType,
      targetId,
      reason,
      details: details.trim() || undefined,
    });
    setOpen(false);
  };

  return (
    <>
      <CsButton
        type="button"
        variant={variant}
        className={className}
        onClick={handleOpen}
        icon={<Flag className="h-4 w-4" />}
      >
        {buttonLabel || t(`triggers.${targetKey}`)}
      </CsButton>

      <CsDialog
        open={open}
        onOpenChange={setOpen}
        title={t(`titles.${targetKey}`)}
        okText={t("actions.submit")}
        cancelText={t("actions.cancel")}
        onOk={() => {
          void handleSubmit();
        }}
        onCancel={() => setOpen(false)}
        loading={isPending}
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-stone-600">
            {t(`descriptions.${targetKey}`)}
          </p>

          <div className="space-y-2">
            <p className="text-sm font-medium text-stone-900">
              {t("fields.reason")}
            </p>
            <CsSelect
              value={reason}
              onChange={(value) =>
                setReason(value as IReportService.ReportReason)
              }
              options={reasonOptions}
              className="h-11 border-stone-200 bg-white"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-stone-900">
              {t("fields.details")}
            </p>
            <Textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder={t("fields.detailsPlaceholder")}
              maxLength={1000}
              className="min-h-28 rounded-xl border-stone-200 bg-white"
            />
            <p className="text-xs text-stone-500">{t("footnote")}</p>
          </div>
        </div>
      </CsDialog>
    </>
  );
};

export default ReportEntityButton;
