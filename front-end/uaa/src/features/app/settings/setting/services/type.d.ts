namespace ISettingService {
  export interface GeneralSettingsDTO {
    id: string;
    key: "general";
    systemName: string;
    adminPortalTitle: string;
    adminPortalTagline: string;
    adminPortalUrl: string;
    adminBrandColor: string;
    systemTagline: string;
    websiteUrl: string;
    brandColor: string;
    defaultLanguage: "en" | "vi";
    timezone: string;
    currency: string;
    dateFormat: string;
    supportEmail: string;
    supportPhone: string;
    maintenanceMode: boolean;
    allowPublicRegistration: boolean;
    enableListingReviews: boolean;
    createdAt: string;
    updatedAt: string;
  }

  export interface UpdateGeneralSettingsDTO {
    systemName: string;
    adminPortalTitle: string;
    adminPortalTagline: string;
    adminPortalUrl: string;
    adminBrandColor: string;
    systemTagline: string;
    websiteUrl: string;
    brandColor: string;
    defaultLanguage: "en" | "vi";
    timezone: string;
    currency: string;
    dateFormat: string;
    supportEmail: string;
    supportPhone: string;
    maintenanceMode: boolean;
    allowPublicRegistration: boolean;
    enableListingReviews: boolean;
  }
}
