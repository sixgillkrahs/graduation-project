"use client";

import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar";
import NotificationBell from "@/components/layout/NotificationBell";
import { useSocket } from "@/components/features/message/services/socket-context";
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
import { RootState } from "@/store";
import { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";

const Header = () => {
  const { info } = useSelector((state: RootState) => state.menu);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const socket = useSocket();

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
        <NotificationBell isAuthenticated={isAuthenticated} />
        <Avatar src={user?.avatarUrl} />
      </div>
    </header>
  );
};

export default Header;
