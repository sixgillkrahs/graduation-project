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

function Siderbar({
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
                          className={cn(item.children ? "" : "cursor-pointer")}
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
        <SidebarFooter>
          <Link href="/">
            <ArrowLeft />
            <span>Client Mode</span>
          </Link>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        {header}
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export { Siderbar };
