"use client";

import { Copy, Link2, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Facebook } from "@/components/ui/Icon/Facebook";
import { Zalo } from "@/components/ui/Icon/Zalo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ROUTES } from "@/const/routes";
import { cn } from "@/lib/utils";
import type { PropertyDto } from "../dto/property.dto";

interface ShareListingButtonProps {
  property: PropertyDto;
  displayPrice: string;
  align?: "start" | "center" | "end";
  className?: string;
}

const ShareListingButton = ({
  property,
  displayPrice,
  align = "end",
  className,
}: ShareListingButtonProps) => {
  const t = useTranslations("PropertiesPage");
  const [isOpen, setIsOpen] = useState(false);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return ROUTES.PROPERTY_DETAIL(property._id);
    }

    return new URL(
      ROUTES.PROPERTY_DETAIL(property._id),
      window.location.origin,
    ).toString();
  }, [property._id]);
  const shareText = useMemo(
    () =>
      [
        property.title,
        displayPrice,
        property.location.district,
        property.location.province,
      ]
        .filter(Boolean)
        .join(" • "),
    [
      displayPrice,
      property.location.district,
      property.location.province,
      property.title,
    ],
  );

  const fallbackCopyToClipboard = () => {
    const textarea = document.createElement("textarea");
    textarea.value = shareUrl;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };

  const handleCopyLink = async (showToast = true) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        fallbackCopyToClipboard();
      }

      if (showToast) {
        toast.success(t("detail.linkCopied"));
      }
      setIsOpen(false);
    } catch {
      fallbackCopyToClipboard();
      if (showToast) {
        toast.success(t("detail.linkCopied"));
      }
      setIsOpen(false);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      await handleCopyLink(false);
      toast.info(t("detail.shareFallbackCopied"));
      return;
    }

    try {
      await navigator.share({
        title: property.title,
        text: shareText,
        url: shareUrl,
      });
      setIsOpen(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }
  };

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=720,height=680");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
            className,
          )}
        >
          <Share2 className="h-4 w-4" /> {t("detail.shareListings")}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-[22rem] rounded-2xl border border-border/80 p-4 shadow-xl"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t("detail.shareListings")}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {t("detail.sharePrompt")}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {property.title}
            </p>
            <p className="mt-1 text-xs font-medium text-primary">
              {displayPrice}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {shareUrl}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void handleNativeShare()}
              className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <Link2 className="h-4 w-4 text-primary" />
              {t("detail.shareViaLink")}
            </button>

            <button
              type="button"
              onClick={() =>
                openShareWindow(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    shareUrl,
                  )}&quote=${encodeURIComponent(shareText)}`,
                )
              }
              className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <Facebook className="h-4 w-4 text-[#1877F2]" />
              {t("detail.shareOnFacebook")}
            </button>

            <button
              type="button"
              onClick={() =>
                openShareWindow(
                  `https://zalo.me/share?url=${encodeURIComponent(shareUrl)}`,
                )
              }
              className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <Zalo className="h-4 w-4 text-[#0068FF]" />
              {t("detail.shareOnZalo")}
            </button>

            <button
              type="button"
              onClick={() => void handleCopyLink()}
              className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <Copy className="h-4 w-4 text-primary" />
              {t("detail.copyLink")}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShareListingButton;
