import { getLandingSettings } from "@/lib/landing-settings";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const [store, settings] = await Promise.all([cookies(), getLandingSettings()]);
  const locale = store.get("locale")?.value || settings.defaultLanguage;

  return {
    locale,
    messages: (await import(`../../../messages/${locale}.json`)).default,
  };
});
