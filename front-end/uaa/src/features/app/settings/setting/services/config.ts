export const GeneralSettingsQueryKey = {
  GetGeneralSettings: "settings/getGeneralSettings",
  GetPublicGeneralSettings: "settings/getPublicGeneralSettings",
};

export const GeneralSettingsEndpoint = {
  GetGeneralSettings: () => "/settings/general",
  GetPublicGeneralSettings: () => "/settings/public/general",
  UpdateGeneralSettings: () => "/settings/general",
};
