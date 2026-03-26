import FeatureAvailabilityNotice from "@/components/layout/FeatureAvailabilityNotice";
import { getLandingSettings } from "@/lib/landing-settings";
import SignUp from "@/components/features/sign-up";

const Page = async () => {
  const settings = await getLandingSettings();

  if (!settings.allowPublicRegistration) {
    return (
      <FeatureAvailabilityNotice
        title="Public registration is currently closed"
        description="New account creation has been disabled by platform settings. Please contact support if you need access."
      />
    );
  }

  return <SignUp />;
};

export default Page;
