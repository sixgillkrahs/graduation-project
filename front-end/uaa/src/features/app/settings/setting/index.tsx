import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from "antd";
import {
  Building2,
  Clock3,
  Globe2,
  Palette,
  RotateCcw,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useUpdateGeneralSettings } from "./services/mutate";
import { useGetGeneralSettings } from "./services/query";
import { type ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";

const { Paragraph, Text, Title } = Typography;

type GeneralSettingsFormValues = ISettingService.UpdateGeneralSettingsDTO;

const defaultGeneralSettings: GeneralSettingsFormValues = {
  systemName: "Gra Estate",
  adminPortalTitle: "Gra Estate Admin",
  systemTagline: "Operations center for listings, agents, reviews, and platform health.",
  websiteUrl: "http://localhost:3000",
  brandColor: "#14532d",
  defaultLanguage: "vi",
  timezone: "Asia/Ho_Chi_Minh",
  currency: "VND",
  dateFormat: "DD/MM/YYYY",
  supportEmail: "support@gra-estate.local",
  supportPhone: "+84 28 9999 8888",
  maintenanceMode: false,
  allowPublicRegistration: true,
  enableListingReviews: true,
};

const languageOptions = [
  { label: "Tiếng Việt", value: "vi" },
  { label: "English", value: "en" },
];

const timezoneOptions = [
  { label: "Asia/Ho_Chi_Minh (GMT+7)", value: "Asia/Ho_Chi_Minh" },
  { label: "UTC", value: "UTC" },
  { label: "Asia/Singapore (GMT+8)", value: "Asia/Singapore" },
  { label: "America/New_York (GMT-5)", value: "America/New_York" },
];

const currencyOptions = [
  { label: "VND", value: "VND" },
  { label: "USD", value: "USD" },
  { label: "SGD", value: "SGD" },
];

const dateFormatOptions = [
  { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
  { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
  { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
];

const SectionTitle = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">{icon}</div>
      <div>
        <div className="text-base font-semibold text-slate-900">{title}</div>
        <div className="text-sm text-slate-500">{description}</div>
      </div>
    </div>
  );
};

const Setting = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm<GeneralSettingsFormValues>();
  const {
    data: generalSettings,
    isLoading,
    isError,
  } = useGetGeneralSettings();
  const { mutateAsync: updateGeneralSettings, isPending } = useUpdateGeneralSettings();

  useEffect(() => {
    form.setFieldsValue(defaultGeneralSettings);
  }, [form]);

  useEffect(() => {
    if (generalSettings?.data) {
      form.setFieldsValue({
        ...defaultGeneralSettings,
        ...generalSettings.data,
      });
    }
  }, [form, generalSettings?.data]);

  const handleSave = async (values: GeneralSettingsFormValues) => {
    await updateGeneralSettings(values);
  };

  const handleReset = () => {
    form.setFieldsValue(defaultGeneralSettings);

    message.success(t("settings.general.messages.resetSuccess"));
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={defaultGeneralSettings}
      onFinish={handleSave}
      className="flex w-full flex-col gap-6 pb-6"
    >
      <Form.Item noStyle shouldUpdate>
        {() => {
          const preview = {
            ...defaultGeneralSettings,
            ...(form.getFieldsValue() as Partial<GeneralSettingsFormValues>),
          };
          const languageLabel =
            languageOptions.find((item) => item.value === preview.defaultLanguage)?.label ||
            preview.defaultLanguage;

          return (
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_42%),linear-gradient(135deg,_#ffffff,_#f8fafc)] p-6 shadow-sm">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-4 inline-flex items-center rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                    {t("settings.general.badge")}
                  </div>
                  <Title level={2} className="!mb-2">
                    {t("settings.general.title")}
                  </Title>
                  <Paragraph className="!mb-4 !max-w-2xl !text-slate-600">
                    {t("settings.general.description")}
                  </Paragraph>
                  <div className="flex flex-wrap gap-2">
                    <Tag
                      color={preview.maintenanceMode ? "volcano" : "green"}
                      className="rounded-full px-3 py-1 text-sm"
                    >
                      {preview.maintenanceMode
                        ? t("settings.general.preview.maintenance")
                        : t("settings.general.preview.live")}
                    </Tag>
                    <Tag className="rounded-full px-3 py-1 text-sm">{languageLabel}</Tag>
                    <Tag className="rounded-full px-3 py-1 text-sm">{preview.timezone}</Tag>
                    <Tag className="rounded-full px-3 py-1 text-sm">{preview.currency}</Tag>
                  </div>
                </div>

                <div
                  className="min-w-[280px] rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-sm"
                  style={{
                    boxShadow: `0 18px 50px -30px ${preview.brandColor}`,
                  }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {t("settings.general.preview.title")}
                    </Text>
                    <div
                      className="h-3 w-3 rounded-full border border-white"
                      style={{ backgroundColor: preview.brandColor }}
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-950 p-4 text-white">
                    <div className="mb-6 flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-base font-bold text-white"
                        style={{ backgroundColor: preview.brandColor }}
                      >
                        {(preview.systemName || "G").slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{preview.adminPortalTitle}</div>
                        <div className="text-xs text-slate-400">{preview.systemTagline}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="mb-1 text-slate-400">
                          {t("settings.general.preview.language")}
                        </div>
                        <div>{languageLabel}</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="mb-1 text-slate-400">
                          {t("settings.general.preview.support")}
                        </div>
                        <div>{preview.supportEmail}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </Form.Item>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <Card className="rounded-3xl">
            <SectionTitle
              icon={<Building2 className="h-5 w-5" />}
              title={t("settings.general.sections.platform.title")}
              description={t("settings.general.sections.platform.description")}
            />
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t("settings.general.fields.systemName")}
                  name="systemName"
                  rules={[{ required: true, message: t("settings.general.validation.systemName") }]}
                >
                  <Input placeholder={t("settings.general.placeholders.systemName")} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t("settings.general.fields.adminPortalTitle")}
                  name="adminPortalTitle"
                  rules={[
                    { required: true, message: t("settings.general.validation.adminPortalTitle") },
                  ]}
                >
                  <Input placeholder={t("settings.general.placeholders.adminPortalTitle")} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  label={t("settings.general.fields.systemTagline")}
                  name="systemTagline"
                  rules={[
                    { required: true, message: t("settings.general.validation.systemTagline") },
                  ]}
                >
                  <Input.TextArea
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    placeholder={t("settings.general.placeholders.systemTagline")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t("settings.general.fields.websiteUrl")}
                  name="websiteUrl"
                  rules={[
                    { required: true, message: t("settings.general.validation.websiteUrl") },
                    { type: "url", message: t("settings.general.validation.websiteUrlInvalid") },
                  ]}
                >
                  <Input placeholder={t("settings.general.placeholders.websiteUrl")} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t("settings.general.fields.brandColor")}
                  name="brandColor"
                  rules={[
                    { required: true, message: t("settings.general.validation.brandColor") },
                    {
                      pattern: /^#([0-9a-fA-F]{6})$/,
                      message: t("settings.general.validation.brandColorInvalid"),
                    },
                  ]}
                >
                  <Input type="color" className="h-12 !p-1" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card className="rounded-3xl">
            <SectionTitle
              icon={<Globe2 className="h-5 w-5" />}
              title={t("settings.general.sections.regional.title")}
              description={t("settings.general.sections.regional.description")}
            />
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t("settings.general.fields.defaultLanguage")}
                  name="defaultLanguage"
                  rules={[
                    { required: true, message: t("settings.general.validation.defaultLanguage") },
                  ]}
                >
                  <Select options={languageOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t("settings.general.fields.timezone")}
                  name="timezone"
                  rules={[{ required: true, message: t("settings.general.validation.timezone") }]}
                >
                  <Select options={timezoneOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t("settings.general.fields.currency")}
                  name="currency"
                  rules={[{ required: true, message: t("settings.general.validation.currency") }]}
                >
                  <Select options={currencyOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t("settings.general.fields.dateFormat")}
                  name="dateFormat"
                  rules={[{ required: true, message: t("settings.general.validation.dateFormat") }]}
                >
                  <Select options={dateFormatOptions} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card className="rounded-3xl">
            <SectionTitle
              icon={<ShieldCheck className="h-5 w-5" />}
              title={t("settings.general.sections.operations.title")}
              description={t("settings.general.sections.operations.description")}
            />
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t("settings.general.fields.supportEmail")}
                  name="supportEmail"
                  rules={[
                    { required: true, message: t("settings.general.validation.supportEmail") },
                    { type: "email", message: t("settings.general.validation.supportEmailInvalid") },
                  ]}
                >
                  <Input placeholder={t("settings.general.placeholders.supportEmail")} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t("settings.general.fields.supportPhone")}
                  name="supportPhone"
                  rules={[
                    { required: true, message: t("settings.general.validation.supportPhone") },
                  ]}
                >
                  <Input placeholder={t("settings.general.placeholders.supportPhone")} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label={t("settings.general.fields.maintenanceMode")}
                  name="maintenanceMode"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label={t("settings.general.fields.allowPublicRegistration")}
                  name="allowPublicRegistration"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label={t("settings.general.fields.enableListingReviews")}
                  name="enableListingReviews"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>

        <div className="grid h-fit gap-6">
          <Card className="rounded-3xl">
            <SectionTitle
              icon={<Clock3 className="h-5 w-5" />}
              title={t("settings.general.sidePanel.storage.title")}
              description={t("settings.general.sidePanel.storage.description")}
            />
            <Alert
              type="info"
              showIcon
              className="mb-4"
              message={t("settings.general.sidePanel.storage.alertTitle")}
              description={t("settings.general.sidePanel.storage.alertDescription")}
            />
            {isError && (
              <Alert
                type="error"
                showIcon
                className="mb-4"
                message={t("settings.general.messages.loadError")}
              />
            )}
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 text-sm font-medium text-slate-700">
                {t("settings.general.sidePanel.storage.lastSaved")}
              </div>
              <div className="text-sm text-slate-500">
                {generalSettings?.data?.updatedAt
                  ? new Date(generalSettings.data.updatedAt).toLocaleString()
                  : t("settings.general.sidePanel.storage.neverSaved")}
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl">
            <SectionTitle
              icon={<Palette className="h-5 w-5" />}
              title={t("settings.general.sidePanel.actions.title")}
              description={t("settings.general.sidePanel.actions.description")}
            />
            <Space direction="vertical" className="w-full">
              <Button
                type="primary"
                htmlType="submit"
                icon={<Save className="h-4 w-4" />}
                className="w-full"
                loading={isLoading || isPending}
              >
                {t("button.save")}
              </Button>
              <Button
                icon={<RotateCcw className="h-4 w-4" />}
                className="w-full"
                onClick={handleReset}
              >
                {t("settings.general.actions.reset")}
              </Button>
            </Space>
          </Card>
        </div>
      </div>
    </Form>
  );
};

export default Setting;
