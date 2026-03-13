"use client";

import type { ReactNode } from "react";
import { CsButton } from "@/components/custom";
import { cn } from "@/lib/utils";

type StateSurfaceTone = "neutral" | "danger" | "brand";
type StateSurfaceSize = "default" | "compact";

interface StateSurfaceAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary";
}

interface StateSurfaceProps {
  icon: ReactNode;
  title: string;
  description: string;
  eyebrow?: string;
  tone?: StateSurfaceTone;
  size?: StateSurfaceSize;
  className?: string;
  primaryAction?: StateSurfaceAction;
  secondaryAction?: StateSurfaceAction;
  children?: ReactNode;
}

const toneClasses: Record<
  StateSurfaceTone,
  {
    panel: string;
    iconWrap: string;
    eyebrow: string;
  }
> = {
  neutral: {
    panel:
      "border-stone-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_52%,#f3f4f6_100%)]",
    iconWrap: "border-stone-200 bg-white text-stone-700 shadow-sm",
    eyebrow: "text-stone-500",
  },
  danger: {
    panel:
      "border-rose-200 bg-[linear-gradient(135deg,#fff7f7_0%,#ffffff_52%,#fff1f2_100%)]",
    iconWrap: "border-rose-200 bg-white text-rose-600 shadow-sm",
    eyebrow: "text-rose-500",
  },
  brand: {
    panel:
      "border-[color:var(--color-border-primary)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(255,244,245,0.95)_52%,rgba(255,232,236,0.92)_100%)]",
    iconWrap:
      "border-[color:var(--color-border-primary)] bg-white text-[color:var(--color-text-primary)] shadow-sm",
    eyebrow: "text-[color:var(--color-text-primary)]",
  },
};

const actionVariantClassName: Record<
  NonNullable<StateSurfaceAction["variant"]>,
  string
> = {
  default: "",
  outline: "bg-white! text-black border border-black/10",
  secondary: "bg-white! text-black border border-black/10",
};

const StateSurface = ({
  icon,
  title,
  description,
  eyebrow,
  tone = "neutral",
  size = "default",
  className,
  primaryAction,
  secondaryAction,
  children,
}: StateSurfaceProps) => {
  const toneClass = toneClasses[tone];

  return (
    <div
      className={cn(
        "rounded-[32px] border px-6 text-center shadow-sm",
        size === "default" ? "py-12 md:px-10 md:py-16" : "py-10 md:px-8",
        toneClass.panel,
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex flex-col items-center",
          size === "default" ? "max-w-xl" : "max-w-md",
        )}
      >
        <div
          className={cn(
            "mb-5 flex items-center justify-center rounded-full border",
            size === "default" ? "h-16 w-16" : "h-14 w-14",
            toneClass.iconWrap,
          )}
        >
          {icon}
        </div>

        {eyebrow ? (
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.24em]",
              toneClass.eyebrow,
            )}
          >
            {eyebrow}
          </p>
        ) : null}

        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
          {description}
        </p>

        {primaryAction || secondaryAction || children ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {secondaryAction ? (
              <CsButton
                type="button"
                variant={secondaryAction.variant || "outline"}
                className={cn(
                  actionVariantClassName[secondaryAction.variant || "outline"],
                )}
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </CsButton>
            ) : null}

            {primaryAction ? (
              <CsButton
                type="button"
                variant={primaryAction.variant || "default"}
                className={cn(
                  actionVariantClassName[primaryAction.variant || "default"],
                )}
                onClick={primaryAction.onClick}
              >
                {primaryAction.label}
              </CsButton>
            ) : null}

            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StateSurface;
