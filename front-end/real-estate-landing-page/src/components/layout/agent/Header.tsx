"use client";

import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar";
import { useSocket } from "@/components/features/message/services/socket-context";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

interface Notification {
  message: string;
  status: string;
  timestamp: string;
  propertyId: string;
}

const Header = () => {
  const { info } = useSelector((state: RootState) => state.menu);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const socket = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userId = user?._id;

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

  useEffect(() => {
    if (!socket) return;

    socket.on("property_status_update", (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);

      toast.info(data.message, {
        description: `Status: ${data.status}`,
        duration: 5000,
      });
    });

    return () => {
      socket.off("property_status_update");
    };
  }, [socket]);

  return (
    <header className="flex justify-between h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 shadow-2xs w-full pr-10 relative">
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

      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="cursor-pointer relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) {
                setUnreadCount(0);
              }
            }}
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </div>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={() => setNotifications([])}
                    className="text-xs text-blue-500 hover:text-blue-600"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notif, index) => (
                      <div
                        key={index}
                        className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer last:border-0"
                      >
                        <p className="text-sm text-gray-800 font-medium mb-1">
                          {notif.message}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <Badge
                            variant={
                              notif.status === "PUBLISHED"
                                ? "default"
                                : "destructive"
                            }
                            className="text-[10px] h-5 px-2"
                          >
                            {notif.status}
                          </Badge>
                          <span className="text-[10px] text-gray-400">
                            {new Date(notif.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Avatar src={user?.avatarUrl} />
      </div>
    </header>
  );
};

export default Header;
