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
  Tabs,
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
import type { ChangePasswordPayload } from "@shared/auth/AuthService";
import { useChangePassword } from "@shared/auth/mutation";
import { useDateTimeFormatter } from "@shared/hooks/useDateTimeFormatter";
import { type ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUpdateGeneralSettings } from "./services/mutate";
import { useGetGeneralSettings } from "./services/query";

const { Paragraph, Text, Title } = Typography;

type GeneralSettingsFormValues = ISettingService.UpdateGeneralSettingsDTO;
type ChangePasswordFormValues = ChangePasswordPayload;

const defaultGeneralSettings: GeneralSettingsFormValues = {
  systemName: "Gra Estate",
  adminPortalTitle: "Gra Estate Admin",
  adminPortalTagline: "Operations center for listings, agents, reviews, and platform health.",
  adminPortalUrl: "http://localhost:5173",
  adminBrandColor: "#14532d",
  systemTagline: "Discover verified property listings, connect with agents, and explore homes for sale or rent.",
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
}) => (
  <div className="mb-6 flex items-start gap-3">
    <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">{icon}</div>
    <div>
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <div className="text-sm text-slate-500">{description}</div>
    </div>
  </div>
);

const PreviewCard = ({
  accentColor,
  eyebrow,
  title,
  description,
  url,
  footerLabel,
  footerValue,
}: {
  accentColor: string;
  eyebrow: string;
  title: string;
  description: string;
  url: string;
  footerLabel: string;
  footerValue: string;
}) => (
  <div
    className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-sm"
    style={{ boxShadow: `0 18px 50px -30px ${accentColor}` }}
  >
    <div className="mb-3 flex items-center justify-between">
      <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {eyebrow}
      </Text>
      <div
        className="h-3 w-3 rounded-full border border-white"
        style={{ backgroundColor: accentColor }}
      />
    </div>
    <div className="rounded-2xl border border-slate-100 bg-slate-950 p-4 text-white">
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-base font-bold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {(title || "G").slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-xs text-slate-400">{description}</div>
        </div>
      </div>
      <div className="grid gap-3 text-xs">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-1 text-slate-400">URL</div>
          <div className="break-all">{url}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-1 text-slate-400">{footerLabel}</div>
          <div>{footerValue}</div>
        </div>
      </div>
    </div>
  </div>
);

const Setting = () => {
  const { t } = useTranslation();
  const { formatDateTime } = useDateTimeFormatter();
  const [form] = Form.useForm<GeneralSettingsFormValues>();
  const [passwordForm] = Form.useForm<ChangePasswordFormValues>();
  const { data: generalSettings, isLoading, isError } = useGetGeneralSettings();
  const { mutateAsync: updateGeneralSettings, isPending } = useUpdateGeneralSettings();
  const { mutateAsync: changePassword, isPending: isChangingPassword } = useChangePassword();

  useEffect(() => {
    form.setFieldsValue(defaultGeneralSettings);
  }, [form]);

  useEffect(() => {
    if (generalSettings?.data) {
      form.setFieldsValue({ ...defaultGeneralSettings, ...generalSettings.data });
    }
  }, [form, generalSettings?.data]);

  const handleReset = () => {
    form.setFieldsValue(defaultGeneralSettings);
    message.success(t("settings.general.messages.resetSuccess"));
  };

  const handleChangePassword = async (values: ChangePasswordFormValues) => {
    await changePassword(values);
    passwordForm.resetFields();
    message.success(t("settings.general.password.messages.success"));
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={defaultGeneralSettings}
      onFinish={updateGeneralSettings}
      component={false}
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

          const landingTab = (
            <div className="grid gap-6">
              <PreviewCard
                accentColor={preview.brandColor}
                eyebrow={t("settings.general.preview.landingTitle")}
                title={preview.systemName}
                description={preview.systemTagline}
                url={preview.websiteUrl}
                footerLabel={t("settings.general.preview.support")}
                footerValue={preview.supportEmail}
              />
              <Card className="rounded-3xl">
                <SectionTitle
                  icon={<Globe2 className="h-5 w-5" />}
                  title={t("settings.general.sections.landing.title")}
                  description={t("settings.general.sections.landing.description")}
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
                  <Col xs={24} md={16}>
                    <Form.Item
                      label={t("settings.general.fields.systemTagline")}
                      name="systemTagline"
                      rules={[{ required: true, message: t("settings.general.validation.systemTagline") }]}
                    >
                      <Input.TextArea
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        placeholder={t("settings.general.placeholders.systemTagline")}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
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
                  icon={<ShieldCheck className="h-5 w-5" />}
                  title={t("settings.general.sections.operations.title")}
                  description={t("settings.general.sections.operations.description")}
                />
                <Alert
                  type="info"
                  showIcon
                  className="mb-6"
                  message={t("settings.general.sections.operations.scopeTitle")}
                  description={t("settings.general.sections.operations.scopeDescription")}
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
                      rules={[{ required: true, message: t("settings.general.validation.supportPhone") }]}
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
          );

          const uaaTab = (
            <div className="grid gap-6">
              <PreviewCard
                accentColor={preview.adminBrandColor}
                eyebrow={t("settings.general.preview.uaaTitle")}
                title={preview.adminPortalTitle}
                description={preview.adminPortalTagline}
                url={preview.adminPortalUrl}
                footerLabel={t("settings.general.preview.language")}
                footerValue={languageLabel}
              />
              <Card className="rounded-3xl">
                <SectionTitle
                  icon={<Building2 className="h-5 w-5" />}
                  title={t("settings.general.sections.uaa.title")}
                  description={t("settings.general.sections.uaa.description")}
                />
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={t("settings.general.fields.adminPortalTitle")}
                      name="adminPortalTitle"
                      rules={[{ required: true, message: t("settings.general.validation.adminPortalTitle") }]}
                    >
                      <Input placeholder={t("settings.general.placeholders.adminPortalTitle")} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={t("settings.general.fields.adminPortalUrl")}
                      name="adminPortalUrl"
                      rules={[
                        { required: true, message: t("settings.general.validation.adminPortalUrl") },
                        { type: "url", message: t("settings.general.validation.adminPortalUrlInvalid") },
                      ]}
                    >
                      <Input placeholder={t("settings.general.placeholders.adminPortalUrl")} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={16}>
                    <Form.Item
                      label={t("settings.general.fields.adminPortalTagline")}
                      name="adminPortalTagline"
                      rules={[{ required: true, message: t("settings.general.validation.adminPortalTagline") }]}
                    >
                      <Input.TextArea
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        placeholder={t("settings.general.placeholders.adminPortalTagline")}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={t("settings.general.fields.adminBrandColor")}
                      name="adminBrandColor"
                      rules={[
                        { required: true, message: t("settings.general.validation.adminBrandColor") },
                        {
                          pattern: /^#([0-9a-fA-F]{6})$/,
                          message: t("settings.general.validation.adminBrandColorInvalid"),
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
                  icon={<Palette className="h-5 w-5" />}
                  title={t("settings.general.sections.regional.title")}
                  description={t("settings.general.sections.regional.description")}
                />
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={t("settings.general.fields.defaultLanguage")}
                      name="defaultLanguage"
                      rules={[{ required: true, message: t("settings.general.validation.defaultLanguage") }]}
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
                  title={t("settings.general.password.title")}
                  description={t("settings.general.password.description")}
                />
                <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={t("settings.general.password.fields.oldPassword")}
                        name="oldPassword"
                        rules={[{ required: true, message: t("settings.general.password.validation.oldPassword") }]}
                      >
                        <Input.Password placeholder={t("settings.general.password.placeholders.oldPassword")} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={t("settings.general.password.fields.newPassword")}
                        name="newPassword"
                        rules={[
                          { required: true, message: t("settings.general.password.validation.newPassword") },
                          { min: 6, message: t("settings.general.password.validation.newPasswordMin") },
                        ]}
                      >
                        <Input.Password placeholder={t("settings.general.password.placeholders.newPassword")} />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item
                        label={t("settings.general.password.fields.confirmPassword")}
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                          { required: true, message: t("settings.general.password.validation.confirmPassword") },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue("newPassword") === value) {
                                return Promise.resolve();
                              }

                              return Promise.reject(
                                new Error(
                                  t("settings.general.password.validation.confirmPasswordMatch"),
                                ),
                              );
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          placeholder={t("settings.general.password.placeholders.confirmPassword")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <div className="flex justify-end">
                    <Button type="primary" htmlType="submit" loading={isChangingPassword}>
                      {t("settings.general.password.actions.submit")}
                    </Button>
                  </div>
                </Form>
              </Card>
            </div>
          );

          return (
            <div className="grid gap-6 pb-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="grid gap-6">
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_42%),linear-gradient(135deg,_#ffffff,_#f8fafc)] p-6 shadow-sm">
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
                      <Tag color={preview.maintenanceMode ? "volcano" : "green"} className="rounded-full px-3 py-1 text-sm">
                        {preview.maintenanceMode
                          ? t("settings.general.preview.maintenance")
                          : t("settings.general.preview.live")}
                      </Tag>
                      <Tag className="rounded-full px-3 py-1 text-sm">{languageLabel}</Tag>
                      <Tag className="rounded-full px-3 py-1 text-sm">{preview.timezone}</Tag>
                      <Tag className="rounded-full px-3 py-1 text-sm">{preview.currency}</Tag>
                    </div>
                  </div>
                </div>
                <Tabs
                  defaultActiveKey="landing"
                  items={[
                    { key: "landing", label: t("settings.general.tabs.landing"), children: landingTab },
                    { key: "uaa", label: t("settings.general.tabs.uaa"), children: uaaTab },
                  ]}
                />
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
                        ? formatDateTime(generalSettings.data.updatedAt)
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
                      icon={<Save className="h-4 w-4" />}
                      className="w-full"
                      loading={isLoading || isPending}
                      onClick={() => form.submit()}
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
          );
        }}
      </Form.Item>
    </Form>
  );
};

export default Setting;
