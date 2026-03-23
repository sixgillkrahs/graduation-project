"use client";

import type { ComponentProps } from "react";
import { useTheme } from "next-themes";
import { Toaster as SileoToaster } from "sileo";

type ToasterProps = ComponentProps<typeof SileoToaster>;

const Toaster = (props: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return <SileoToaster theme={theme as ToasterProps["theme"]} {...props} />;
};

export { Toaster };
