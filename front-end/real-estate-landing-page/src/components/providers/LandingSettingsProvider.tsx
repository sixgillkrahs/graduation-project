"use client";

import {
  type LandingSettings,
  defaultLandingSettings,
} from "@/lib/landing-settings";
import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from "react";

const LandingSettingsContext =
  createContext<LandingSettings>(defaultLandingSettings);

const getBrandVariables = (brandColor: string): CSSProperties => ({
  "--primary": brandColor,
  "--ring": brandColor,
  "--sidebar-primary": brandColor,
  "--color-bg-primary": brandColor,
  "--color-text-primary": brandColor,
  "--color-border-primary": `color-mix(in srgb, ${brandColor} 22%, white)`,
} as CSSProperties);

export const LandingSettingsProvider = ({
  children,
  settings,
}: {
  children: ReactNode;
  settings: LandingSettings;
}) => {
  return (
    <LandingSettingsContext.Provider value={settings}>
      <div style={getBrandVariables(settings.brandColor)}>{children}</div>
    </LandingSettingsContext.Provider>
  );
};

export const useLandingSettings = () => useContext(LandingSettingsContext);
