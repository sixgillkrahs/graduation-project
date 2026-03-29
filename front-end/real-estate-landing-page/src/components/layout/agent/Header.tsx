"use client";

import { Check, Globe, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Fragment, useEffect, useTransition } from "react";
import { useSelector } from "react-redux";
import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar";
import { useSocket } from "@/components/features/message/services/socket-context";
import NotificationBell from "@/components/layout/NotificationBell";
import { Avatar } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import type { RootState } from "@/store";

const languageOptions = [
  {
    value: "vi",
    code: "VI",
    label: "Tiếng Việt",
  },
  {
    value: "en",
    code: "EN",
    label: "English",
  },
] as const;

const Header = () => {
  const { info } = useSelector((state: RootState) => state.menu);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const socket = useSocket();
  const locale = useLocale();
  const t = useTranslations("AgentHeader");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentLocale = locale.toLowerCase().startsWith("vi") ? "vi" : "en";

  useEffect(() => {
    const userId = user?.id || user?._id;

    if (socket && userId) {
      socket.emit("identity", {
        header: {
          method: "POST",
        },
        body: {
          userId,
        },
      });
    }
  }, [socket, user]);

  const handleLocaleChange = async (nextLocale: "en" | "vi") => {
    if (nextLocale === currentLocale || isPending) {
      return;
    }

    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    });

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <header className="relative flex h-16 w-full shrink-0 items-center justify-between gap-2 pr-10 shadow-2xs transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 bg-white! text-black active:bg-white!" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {info?.map((item, index) => {
              if (index === info.length - 1) {
                return (
                  <BreadcrumbItem key={item.title}>
                    <BreadcrumbPage className="font-bold text-black uppercase">
                      {item.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                );
              }

              return (
                <Fragment key={item.title}>
                  <BreadcrumbItem key={item.title}>
                    <BreadcrumbLink
                      href={item.href}
                      className="text-black uppercase!"
                    >
                      {item.title}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-1 rounded-full border border-border bg-background p-1 shadow-sm lg:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/35 text-muted-foreground">
            {isPending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
          </div>
          {languageOptions.map((option) => {
            const isActive = option.value === currentLocale;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleLocaleChange(option.value)}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200 ${
                  isActive
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
                aria-pressed={isActive}
                aria-label={`${t("switchLanguage")} ${option.label}`}
                disabled={isPending}
                title={option.label}
              >
                <span>{option.code}</span>
                {isActive ? <Check className="h-3.5 w-3.5" /> : null}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1 shadow-sm lg:hidden">
          {languageOptions.map((option) => {
            const isActive = option.value === currentLocale;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleLocaleChange(option.value)}
                className={`rounded-full px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-200 ${
                  isActive
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
                aria-pressed={isActive}
                aria-label={`${t("switchLanguage")} ${option.label}`}
                disabled={isPending}
              >
                {option.code}
              </button>
            );
          })}
        </div>
        <NotificationBell isAuthenticated={isAuthenticated} />
        <Avatar src={user?.avatarUrl} />
      </div>
    </header>
  );
};

export default Header;
