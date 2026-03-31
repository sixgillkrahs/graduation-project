import { useGetGeneralSettings } from "@/features/app/settings/setting/services/query";
import {
  defaultDateTimeFormatterSettings,
  type DateTimeFormatterSettings,
} from "gra-helper";
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";

type UaaGeneralSettings = DateTimeFormatterSettings & {
  systemName: string;
  adminPortalTitle: string;
  adminPortalTagline: string;
  adminPortalUrl: string;
  adminBrandColor: string;
  supportEmail: string;
  supportPhone: string;
};

const defaultGeneralSettings: UaaGeneralSettings = {
  ...defaultDateTimeFormatterSettings,
  systemName: "Gra Estate",
  adminPortalTitle: "Gra Estate Admin",
  adminPortalTagline:
    "Operations center for listings, agents, reviews, and platform health.",
  adminPortalUrl: "http://localhost:5173",
  adminBrandColor: "#14532d",
  supportEmail: "support@gra-estate.local",
  supportPhone: "+84 28 9999 8888",
};

const GeneralSettingsContext = createContext<UaaGeneralSettings>(defaultGeneralSettings);

export const GeneralSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useGetGeneralSettings();

  const value = useMemo<UaaGeneralSettings>(
    () => ({
      ...defaultGeneralSettings,
      defaultLanguage:
        data?.data?.defaultLanguage || defaultGeneralSettings.defaultLanguage,
      timezone: data?.data?.timezone || defaultGeneralSettings.timezone,
      dateFormat: data?.data?.dateFormat || defaultGeneralSettings.dateFormat,
      systemName: data?.data?.systemName || defaultGeneralSettings.systemName,
      adminPortalTitle:
        data?.data?.adminPortalTitle || defaultGeneralSettings.adminPortalTitle,
      adminPortalTagline:
        data?.data?.adminPortalTagline || defaultGeneralSettings.adminPortalTagline,
      adminPortalUrl: data?.data?.adminPortalUrl || defaultGeneralSettings.adminPortalUrl,
      adminBrandColor:
        data?.data?.adminBrandColor || defaultGeneralSettings.adminBrandColor,
      supportEmail: data?.data?.supportEmail || defaultGeneralSettings.supportEmail,
      supportPhone: data?.data?.supportPhone || defaultGeneralSettings.supportPhone,
    }),
    [
      data?.data?.adminBrandColor,
      data?.data?.adminPortalTagline,
      data?.data?.adminPortalTitle,
      data?.data?.adminPortalUrl,
      data?.data?.dateFormat,
      data?.data?.defaultLanguage,
      data?.data?.supportEmail,
      data?.data?.supportPhone,
      data?.data?.systemName,
      data?.data?.timezone,
    ],
  );

  useEffect(() => {
    document.title = value.adminPortalTitle;
    document.documentElement.style.setProperty("--uaa-brand-color", value.adminBrandColor);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", value.adminBrandColor);
  }, [value.adminBrandColor, value.adminPortalTitle]);

  return (
    <GeneralSettingsContext.Provider value={value}>
      {children}
    </GeneralSettingsContext.Provider>
  );
};

export const useGeneralSettings = () => useContext(GeneralSettingsContext);
