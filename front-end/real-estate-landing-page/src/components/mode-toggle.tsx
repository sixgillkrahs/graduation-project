"use client";

import { Moon, Sun } from "lucide-react";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { CsButton } from "@/components/custom/button";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const srLabel = locale === "vi" ? "Chuyển giao diện" : "Toggle theme";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <CsButton variant="ghost" size="icon" className="w-[42px] h-[42px]">
        <span className="sr-only">{srLabel}</span>
      </CsButton>
    );
  }

  return (
    <CsButton
      variant="outline"
      size="icon"
      className="w-[42px] h-[42px] rounded-full"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">{srLabel}</span>
    </CsButton>
  );
}
