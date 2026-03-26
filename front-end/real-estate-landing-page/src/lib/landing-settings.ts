import { getApiBaseUrl } from "@/lib/env-base-url";
import { cache } from "react";

export type SupportedLanguage = "en" | "vi";

export interface LandingSettings {
  systemName: string;
  adminPortalTitle: string;
  systemTagline: string;
  websiteUrl: string;
  brandColor: string;
  defaultLanguage: SupportedLanguage;
  timezone: string;
  currency: string;
  dateFormat: string;
  supportEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  allowPublicRegistration: boolean;
  enableListingReviews: boolean;
}

const DEFAULT_BRAND_NAME = "Havenly";
const DEFAULT_DESCRIPTION =
  "Discover verified property listings, connect with agents, and explore homes for sale or rent.";
const DEFAULT_WEBSITE_URL = "http://localhost:3000";

export const defaultLandingSettings: LandingSettings = {
  systemName: DEFAULT_BRAND_NAME,
  adminPortalTitle: `${DEFAULT_BRAND_NAME} Admin`,
  systemTagline: DEFAULT_DESCRIPTION,
  websiteUrl: DEFAULT_WEBSITE_URL,
  brandColor: "#ef4444",
  defaultLanguage: "en",
  timezone: "Asia/Ho_Chi_Minh",
  currency: "VND",
  dateFormat: "DD/MM/YYYY",
  supportEmail: "contact@realestate.com",
  supportPhone: "0966999999",
  maintenanceMode: false,
  allowPublicRegistration: true,
  enableListingReviews: true,
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const normalizeLandingSettings = (
  payload?: Partial<LandingSettings> | null,
): LandingSettings => {
  const websiteUrl = payload?.websiteUrl?.trim() || defaultLandingSettings.websiteUrl;
  const brandColor = payload?.brandColor?.trim() || defaultLandingSettings.brandColor;
  const defaultLanguage = payload?.defaultLanguage === "vi" ? "vi" : "en";

  return {
    ...defaultLandingSettings,
    ...payload,
    systemName: payload?.systemName?.trim() || defaultLandingSettings.systemName,
    adminPortalTitle:
      payload?.adminPortalTitle?.trim() || defaultLandingSettings.adminPortalTitle,
    systemTagline: payload?.systemTagline?.trim() || defaultLandingSettings.systemTagline,
    websiteUrl,
    brandColor,
    defaultLanguage,
    supportEmail: payload?.supportEmail?.trim() || defaultLandingSettings.supportEmail,
    supportPhone: payload?.supportPhone?.trim() || defaultLandingSettings.supportPhone,
    maintenanceMode: Boolean(payload?.maintenanceMode),
    allowPublicRegistration:
      payload?.allowPublicRegistration ?? defaultLandingSettings.allowPublicRegistration,
    enableListingReviews:
      payload?.enableListingReviews ?? defaultLandingSettings.enableListingReviews,
  };
};

export const getBrandName = (settings?: Partial<LandingSettings> | null) =>
  normalizeLandingSettings(settings).systemName;

export const getBrandDescription = (
  settings?: Partial<LandingSettings> | null,
) => normalizeLandingSettings(settings).systemTagline;

export const getConfiguredWebsiteUrl = (
  settings?: Partial<LandingSettings> | null,
) => {
  const candidate = normalizeLandingSettings(settings).websiteUrl;

  try {
    return trimTrailingSlash(new URL(candidate).toString());
  } catch (_error) {
    return trimTrailingSlash(defaultLandingSettings.websiteUrl);
  }
};

export const getLandingSettings = cache(async (): Promise<LandingSettings> => {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    return defaultLandingSettings;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/settings/public/general`, {
      headers: {
        Accept: "application/json",
        "X-Auth-App": "landing",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return defaultLandingSettings;
    }

    const payload = (await response.json()) as {
      data?: Partial<LandingSettings>;
    };

    return normalizeLandingSettings(payload?.data);
  } catch (_error) {
    return defaultLandingSettings;
  }
});
