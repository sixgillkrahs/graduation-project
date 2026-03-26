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
    systemTagline:
      "Operations center for listings, agents, reviews, and platform health.",
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

  getGeneralSettings = async () => {
    let settings = await SettingModel.getGeneralSettings();

    if (!settings) {
      settings = await SettingModel.upsertGeneralSettings(this.defaultGeneralSettings);
    }

    return settings;
  };

  updateGeneralSettings = async (payload: IGeneralSettingsInput) => {
    return SettingModel.upsertGeneralSettings(payload);
  };

  getDefaultGeneralSettings = () => {
    return this.defaultGeneralSettings;
  };
}
