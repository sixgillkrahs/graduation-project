import BecomeAgent from "@/components/features/become-agent";
import FeatureAvailabilityNotice from "@/components/layout/FeatureAvailabilityNotice";
import { getLandingSettings } from "@/lib/landing-settings";
import { getTranslations } from "next-intl/server";

const Page = async () => {
  const [settings, t] = await Promise.all([
    getLandingSettings(),
    getTranslations("BecomeAgentPage.notice"),
  ]);

  if (!settings.allowPublicRegistration) {
    return (
      <FeatureAvailabilityNotice
        title={t("title")}
        description={t("description")}
      />
    );
  }

  return (
    <>
      <BecomeAgent />
    </>
  );
};

export default Page;
