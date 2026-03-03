"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/animate-ui/primitives/radix/collapsible";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { JSX, ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
} from "../animate-ui/components/radix/sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/const/routes";

export interface MenuItem {
  title: string;
  url: string;
  icon?: JSX.Element;
  isActive?: boolean;
  children?: MenuItem[];
}

function CsSidebar({
  items = [],
  children,
  header,
  logo,
  info,
  onClick,
  isPro = false,
}: {
  items: MenuItem[];
  children?: ReactNode;
  header?: ReactNode;
  logo: ReactNode;
  info?: {
    name: string;
    plan: string;
  };
  onClick?: (url: string, title: string) => void;
  isPro?: boolean;
}) {
  const router = useRouter();

  const handleClick = (url: string, title: string) => {
    onClick?.(url, title);
    router.push(url);
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
              {logo}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-base">
                {info?.name}
              </span>
              <span className="truncate text-xs">{info?.plan}</span>
            </div>
          </SidebarMenuButton>
        </SidebarHeader>
        <SidebarContent>
          <div className="flex-1 flex flex-col justify-between">
            <SidebarGroup>
              <SidebarMenu>
                {items.map((item) => {
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={item.isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            onClick={
                              item.children
                                ? undefined
                                : () => handleClick(item.url, item.title)
                            }
                            className={cn(
                              "py-5",
                              item.children ? "" : "cursor-pointer",
                            )}
                          >
                            {item.icon && item.icon}
                            <span className="truncate text-base">
                              {item.title}
                            </span>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {item.children && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children?.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild>
                                    <Link
                                      href={subItem.url}
                                      onClick={() =>
                                        handleClick(subItem.url, subItem.title)
                                      }
                                    >
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>

            {/* Upgrade Plan Card - Hidden when already PRO */}
            {!isPro && (
              <div className="mx-4 mb-4 p-4 mt-auto rounded-xl bg-linear-to-br from-neutral-900 to-neutral-800 text-white shadow-md relative overflow-hidden group">
                <div className="relative z-10 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-400 p-1.5 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-neutral-900"
                      >
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                        <path d="M4 22h16" />
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                      </svg>
                    </div>
                    <span className="font-bold text-sm tracking-tight">
                      Upgrade Plan
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed max-w-[180px]">
                    Get unlimited listings and priority support.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/agent/upgrade")}
                    className="mt-1 w-full text-center bg-white text-neutral-900 hover:bg-neutral-100 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
                  >
                    Upgrade to Pro
                  </button>
                </div>
                <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500 ease-in-out" />
              </div>
            )}
          </div>
        </SidebarContent>
        <SidebarFooter className="border-t p-0">
          <SidebarMenuButton
            tooltip={"Client Mode"}
            onClick={() => {
              router.push(ROUTES.HOME);
            }}
            className="m-2 cursor-pointer"
          >
            <ArrowLeft />
            <span className="truncate text-base">Client Mode</span>
          </SidebarMenuButton>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 shadow-2xs">
          {header}
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export { CsSidebar };
