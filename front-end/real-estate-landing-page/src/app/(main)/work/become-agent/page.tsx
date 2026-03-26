import BecomeAgent from "@/components/features/become-agent";
import FeatureAvailabilityNotice from "@/components/layout/FeatureAvailabilityNotice";
import { getLandingSettings } from "@/lib/landing-settings";

const Page = async () => {
  const settings = await getLandingSettings();

  if (!settings.allowPublicRegistration) {
    return (
      <FeatureAvailabilityNotice
        title="Agent applications are temporarily closed"
        description="This recruitment flow has been turned off from platform settings. Please check back later or contact support for assistance."
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
