import PrivacyPolicy from "@/components/features/privacy-policy";
import { getBrandName, getLandingSettings } from "@/lib/landing-settings";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getLandingSettings();
  const brandName = getBrandName(settings);

  return {
    title: "Privacy Policy",
    description: `Learn how ${brandName} collects, uses, and protects your data.`,
  };
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
