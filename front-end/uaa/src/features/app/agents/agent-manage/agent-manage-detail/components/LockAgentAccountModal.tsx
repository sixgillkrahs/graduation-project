import {
  Button,
  DatePicker,
  Input,
  Modal,
  Radio,
  Space,
  Typography,
  type DatePickerProps,
} from "antd";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const { Text } = Typography;
const { TextArea } = Input;

type QuickLockPreset = "ONE_DAY" | "ONE_WEEK" | "ONE_MONTH";

type LockAgentAccountModalProps = {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (body: IAgentRegistrationService.LockAccountBody) => Promise<void>;
};

type LockAgentAccountFormValues = {
  lockType: "TEMPORARY" | "PERMANENT";
  lockUntil: DatePickerProps["value"];
  quickLockPreset: QuickLockPreset | null;
  reason: string;
};

const defaultValues: LockAgentAccountFormValues = {
  lockType: "TEMPORARY",
  lockUntil: null,
  quickLockPreset: null,
  reason: "",
};

const LockAgentAccountModal = ({
  open,
  loading,
  onCancel,
  onSubmit,
}: LockAgentAccountModalProps) => {
  const { t } = useTranslation("agents");
  const {
    control,
    reset,
    watch,
    setValue,
    clearErrors,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<LockAgentAccountFormValues>({
    defaultValues,
  });

  const lockType = watch("lockType");
  const quickLockPreset = watch("quickLockPreset");

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset]);

  useEffect(() => {
    if (lockType === "PERMANENT") {
      clearErrors("lockUntil");
    }
  }, [clearErrors, lockType]);

  const buildPresetLockUntil = (preset: QuickLockPreset) => {
    const date = new Date();

    switch (preset) {
      case "ONE_DAY":
        date.setDate(date.getDate() + 1);
        break;
      case "ONE_WEEK":
        date.setDate(date.getDate() + 7);
        break;
      case "ONE_MONTH":
        date.setMonth(date.getMonth() + 1);
        break;
    }

    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  };

  const handleFormSubmit = handleSubmit(async (values) => {
    if (values.lockType === "TEMPORARY" && !values.lockUntil && !values.quickLockPreset) {
      setError("lockUntil", {
        type: "manual",
        message: t("manage.lockDateRequired"),
      });
      return;
    }

    const temporaryLockUntil = values.lockUntil
      ? values.lockUntil.endOf("day").toISOString()
      : values.quickLockPreset
        ? buildPresetLockUntil(values.quickLockPreset)
        : undefined;

    await onSubmit({
      lockType: values.lockType,
      reason: values.reason.trim(),
      lockUntil: values.lockType === "TEMPORARY" ? temporaryLockUntil : undefined,
    });
  });

  return (
    <Modal
      title={t("manage.lockModalTitle")}
      open={open}
      onCancel={onCancel}
      onOk={handleFormSubmit}
      okText={t("manage.confirmLock")}
      cancelText={t("detail.cancel")}
      confirmLoading={loading}
      okButtonProps={{ danger: true }}
    >
      <div className="flex flex-col gap-4">
        <Text>{t("manage.lockModalDescription")}</Text>
        <Controller
          name="lockType"
          control={control}
          render={({ field }) => (
            <Radio.Group
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              className="flex flex-col gap-3"
            >
              <Radio value="TEMPORARY">{t("manage.lockByDate")}</Radio>
              <Radio value="PERMANENT">{t("manage.lockForever")}</Radio>
            </Radio.Group>
          )}
        />

        {lockType === "TEMPORARY" ? (
          <div className="flex flex-col gap-2">
            <Text>{t("manage.quickLockSuggestions")}</Text>
            <Space wrap>
              <Button
                type={quickLockPreset === "ONE_DAY" ? "primary" : "default"}
                onClick={() => {
                  setValue("quickLockPreset", "ONE_DAY");
                  setValue("lockUntil", null);
                  clearErrors("lockUntil");
                }}
              >
                {t("manage.lockForOneDay")}
              </Button>
              <Button
                type={quickLockPreset === "ONE_WEEK" ? "primary" : "default"}
                onClick={() => {
                  setValue("quickLockPreset", "ONE_WEEK");
                  setValue("lockUntil", null);
                  clearErrors("lockUntil");
                }}
              >
                {t("manage.lockForOneWeek")}
              </Button>
              <Button
                type={quickLockPreset === "ONE_MONTH" ? "primary" : "default"}
                onClick={() => {
                  setValue("quickLockPreset", "ONE_MONTH");
                  setValue("lockUntil", null);
                  clearErrors("lockUntil");
                }}
              >
                {t("manage.lockForOneMonth")}
              </Button>
            </Space>
            <Text>{t("manage.chooseLockDate")}</Text>
            <Controller
              name="lockUntil"
              control={control}
              render={({ field }) => (
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    setValue("quickLockPreset", null);
                    clearErrors("lockUntil");
                  }}
                  disabledDate={(current) =>
                    !!current && current.endOf("day").valueOf() <= Date.now()
                  }
                />
              )}
            />
            {errors.lockUntil?.message ? (
              <Text type="danger">{errors.lockUntil.message}</Text>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <Text>{t("manage.lockReason")}</Text>
          <Controller
            name="reason"
            control={control}
            rules={{
              validate: (value) =>
                value.trim().length > 0 || t("manage.lockReasonRequired"),
            }}
            render={({ field }) => (
              <TextArea
                rows={4}
                value={field.value}
                onChange={field.onChange}
                placeholder={t("manage.lockReasonPlaceholder")}
                maxLength={500}
                showCount
              />
            )}
          />
          {errors.reason?.message ? <Text type="danger">{errors.reason.message}</Text> : null}
        </div>
      </div>
    </Modal>
  );
};

export default LockAgentAccountModal;
