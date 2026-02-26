import PrivacyPolicy from "@/components/features/privacy-policy";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Havenly",
  description: "Learn how Havenly collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
