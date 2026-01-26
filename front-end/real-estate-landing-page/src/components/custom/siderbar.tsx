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
              <span className="truncate font-semibold">{info?.name}</span>
              <span className="truncate text-xs">{info?.plan}</span>
            </div>
          </SidebarMenuButton>
        </SidebarHeader>
        <SidebarContent>
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
                          <span className="truncate">{item.title}</span>
                          {item.children && (
                            <ChevronRight className="ml-auto transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                          )}
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
        </SidebarContent>
        <SidebarFooter className="border-t p-0">
          <SidebarMenuButton
            tooltip={"Client Mode"}
            onClick={() => {
              router.push("/");
            }}
            className="m-2 cursor-pointer"
          >
            <ArrowLeft />
            <span className="truncate">Client Mode</span>
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
