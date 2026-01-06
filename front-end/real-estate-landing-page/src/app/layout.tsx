import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import localFont from "next/font/local";
import "react-photo-view/dist/react-photo-view.css";
import "../styles/globals.css";
import Wrapper from "./wrapper";

export const satoshi = localFont({
  src: [
    {
      path: "../../public/fonts/Satoshi-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/Satoshi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-satoshi",
});

export const metadata: Metadata = {
  title: "Havenly",
  description: "Real Estate Landing Page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={satoshi.variable}>
      <body className={`${satoshi.variable} antialiased`}>
        <NextIntlClientProvider>
          <Wrapper>{children}</Wrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
