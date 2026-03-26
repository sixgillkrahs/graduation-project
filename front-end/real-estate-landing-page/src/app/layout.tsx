import { getLandingSettings } from "@/lib/landing-settings";
import { buildDefaultMetadata } from "@/lib/seo";
import { Be_Vietnam_Pro } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { cookies } from "next/headers";
import "react-photo-view/dist/react-photo-view.css";
import "../styles/globals.css";
import Wrapper from "./wrapper";

export const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-satoshi",
});

export async function generateMetadata() {
  const settings = await getLandingSettings();

  return buildDefaultMetadata(settings);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, cookieStore] = await Promise.all([
    getLandingSettings(),
    cookies(),
  ]);
  const cookieLocale = cookieStore.get("locale")?.value;
  const locale =
    cookieLocale === "vi"
      ? "vi"
      : cookieLocale === "en"
        ? "en"
        : settings.defaultLanguage;

  return (
    <html
      lang={locale}
      className={beVietnamPro.variable}
      suppressHydrationWarning
    >
      <body
        className={`${beVietnamPro.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider>
          <Wrapper settings={settings}>{children}</Wrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
