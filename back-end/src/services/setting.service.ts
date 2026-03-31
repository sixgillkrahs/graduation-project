import { ENV } from "@/config/env";
import { singleton } from "@/decorators/singleton";
import SettingModel, {
  type IGeneralSettings,
  type IGeneralSettingsInput,
} from "@/models/setting.model";

@singleton
export class SettingService {
  private readonly defaultGeneralSettings: IGeneralSettingsInput = {
    systemName: ENV.APP_NAME || "Gra Estate",
    adminPortalTitle: `${ENV.APP_NAME || "Gra Estate"} Admin`,
    adminPortalTagline:
      "Operations center for listings, agents, reviews, and platform health.",
    adminPortalUrl: ENV.FRONTEND_URL,
    adminBrandColor: "#14532d",
    systemTagline:
      "Discover verified property listings, connect with agents, and explore homes for sale or rent.",
    websiteUrl: ENV.FRONTEND_URLLANDINGPAGE,
    brandColor: "#14532d",
    defaultLanguage: "vi",
    timezone: "Asia/Ho_Chi_Minh",
    currency: "VND",
    dateFormat: "DD/MM/YYYY",
    supportEmail: ENV.SMTP_FROM || "support@gra-estate.local",
    supportPhone: "+84 28 9999 8888",
    maintenanceMode: false,
    allowPublicRegistration: true,
    enableListingReviews: true,
  };

  private normalizeGeneralSettings = (
    payload?: Partial<IGeneralSettings> | null,
  ): IGeneralSettingsInput => {
    return {
      ...this.defaultGeneralSettings,
      ...payload,
      systemName: payload?.systemName?.trim() || this.defaultGeneralSettings.systemName,
      adminPortalTitle:
        payload?.adminPortalTitle?.trim() || this.defaultGeneralSettings.adminPortalTitle,
      adminPortalTagline:
        payload?.adminPortalTagline?.trim() ||
        this.defaultGeneralSettings.adminPortalTagline,
      adminPortalUrl:
        payload?.adminPortalUrl?.trim() || this.defaultGeneralSettings.adminPortalUrl,
      adminBrandColor:
        payload?.adminBrandColor?.trim() || this.defaultGeneralSettings.adminBrandColor,
      systemTagline:
        payload?.systemTagline?.trim() || this.defaultGeneralSettings.systemTagline,
      websiteUrl: payload?.websiteUrl?.trim() || this.defaultGeneralSettings.websiteUrl,
      brandColor: payload?.brandColor?.trim() || this.defaultGeneralSettings.brandColor,
      supportEmail:
        payload?.supportEmail?.trim() || this.defaultGeneralSettings.supportEmail,
      supportPhone:
        payload?.supportPhone?.trim() || this.defaultGeneralSettings.supportPhone,
      defaultLanguage: payload?.defaultLanguage === "en" ? "en" : "vi",
      timezone: payload?.timezone?.trim() || this.defaultGeneralSettings.timezone,
      currency: payload?.currency?.trim() || this.defaultGeneralSettings.currency,
      dateFormat: payload?.dateFormat?.trim() || this.defaultGeneralSettings.dateFormat,
      maintenanceMode: Boolean(payload?.maintenanceMode),
      allowPublicRegistration:
        payload?.allowPublicRegistration ??
        this.defaultGeneralSettings.allowPublicRegistration,
      enableListingReviews:
        payload?.enableListingReviews ??
        this.defaultGeneralSettings.enableListingReviews,
    };
  };

  getGeneralSettings = async () => {
    let settings = await SettingModel.getGeneralSettings();

    if (!settings) {
      settings = await SettingModel.upsertGeneralSettings(this.defaultGeneralSettings);
      return settings;
    }

    const missingAdminPortalFields =
      !settings.adminPortalTagline || !settings.adminPortalUrl || !settings.adminBrandColor;

    if (missingAdminPortalFields) {
      settings = await SettingModel.upsertGeneralSettings(
        this.normalizeGeneralSettings(settings.toObject()),
      );
    }

    return settings;
  };

  updateGeneralSettings = async (payload: IGeneralSettingsInput) => {
    return SettingModel.upsertGeneralSettings(this.normalizeGeneralSettings(payload));
  };

  getDefaultGeneralSettings = () => {
    return this.defaultGeneralSettings;
  };
}
