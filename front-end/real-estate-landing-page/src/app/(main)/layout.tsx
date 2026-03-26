import ChatWidget from "@/components/features/message/ChatWidget";
import PropertyCompareFloatingBar from "@/components/features/properties/compare/PropertyCompareFloatingBar";
import MaintenanceScreen from "@/components/layout/MaintenanceScreen";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { getLandingSettings } from "@/lib/landing-settings";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getLandingSettings();

  if (settings.maintenanceMode) {
    return <MaintenanceScreen settings={settings} />;
  }

  return (
    <div className="relative">
      <Header />
      {children}
      <Footer />
      <PropertyCompareFloatingBar />
      <ChatWidget />
    </div>
  );
}
