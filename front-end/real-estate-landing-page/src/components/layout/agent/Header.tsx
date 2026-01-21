"use client";

import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

const Header = () => {
  const { info } = useSelector((state: RootState) => state.menu);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 shadow-2xs">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 bg-white! text-black active:bg-white!" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {info?.map((item, index) => {
              if (index === info.length - 1) {
                return (
                  <BreadcrumbItem key={item.title}>
                    <BreadcrumbPage className="text-black uppercase font-bold">
                      {item.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                );
              }
              return (
                <>
                  <BreadcrumbItem key={item.title}>
                    <BreadcrumbLink
                      href={item.href}
                      className="text-black uppercase!"
                    >
                      {item.title}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator key={item.title} />
                </>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
};

export default Header;
