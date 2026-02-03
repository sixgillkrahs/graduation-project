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
import { Bell, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import { INoticeDto } from "./dto/notice.dto";
import {
  useDeleteAllNotices,
  useDeleteNotice,
  useReadNotice,
} from "./services/mutate";
import { useGetMyNotices } from "./services/query";
import { cn } from "@/lib/utils";

// Map backend notice to UI notification format if needed, or update interface
interface Notification {
  message: string;
  status: string;
  timestamp: string;
  propertyId?: string;
  isRead: boolean;
  type: string;
  id: string; // Add ID for tracking
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

  // Fetch initial notifications
  const {
    data: noticesData,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetMyNotices({
    page: 1,
    limit: 10, // Load 10 at a time
  });

  const { mutate: readNotice } = useReadNotice();
  const { mutate: deleteNotice } = useDeleteNotice();
  const { mutate: deleteAllNotices } = useDeleteAllNotices();

  // Infinite Scroll Observer
  const observerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!observerRef.current || !scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.1,
      },
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    showNotifications,
    notifications,
  ]);

  const handleDeleteNotice = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering readNotice
    deleteNotice(id, {
      onSuccess: () => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        // Recalculate unread count if deleted notice was unread
        const deletedNotice = notifications.find((n) => n.id === id);
        if (deletedNotice && !deletedNotice.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      },
    });
  };

  const handleReadNotice = (notify: Notification) => {
    if (!notify.isRead) {
      readNotice(notify.id, {
        onSuccess: () => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === notify.id ? { ...n, isRead: true } : n)),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        },
      });
    }
  };

  useEffect(() => {
    if (noticesData?.pages) {
      const allNotices = noticesData.pages.flatMap((page) => page.data.results);

      const formattedNotices: Notification[] = allNotices.map(
        (n: INoticeDto) => ({
          message: n.content,
          status: n.type,
          timestamp: n.createdAt,
          isRead: n.isRead,
          type: n.type,
          propertyId: n.metadata?.propertyId,
          id: n.id,
        }),
      );
      setNotifications(formattedNotices);
      const unread = (noticesData.pages[0].data as any)?.totalUnread;
      setUnreadCount(unread);
    }
  }, [noticesData]);

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

  useEffect(() => {
    if (!socket) return;
    socket.on("property_status_update", (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
      refetch();

      toast.info(data.message, {
        description: `Status: ${data.status}`,
        duration: 5000,
      });
    });

    return () => {
      socket.off("property_status_update");
    };
  }, [socket]);

  const hasUnread = unreadCount > 0;

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
          <button
            type="button"
            className={cn(
              "relative p-2 rounded-full transition-all duration-200",
              "hover:bg-gray-100 active:bg-gray-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2",
              "dark:hover:bg-gray-800 dark:active:bg-gray-700",
            )}
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) {
                setUnreadCount(0);
              }
            }}
            aria-label={`Notifications ${hasUnread ? `(${unreadCount} unread)` : ""}`}
          >
            {/* Icon Bell */}
            <Bell
              className={cn(
                "w-5 h-5 transition-transform duration-300",
                hasUnread ? "text-red-500" : "text-gray-600 dark:text-gray-300",
                hasUnread && "animate-[ring_1.5s_ease-in-out_infinite]",
              )}
            />

            {/* Badge unread */}
            {hasUnread && (
              <span
                className={cn(
                  "absolute top-0 right-0 flex items-center justify-center",
                  "min-w-[18px] h-4.5 px-1.5 text-[10px] font-bold",
                  "rounded-full bg-red-500 text-white",
                  "shadow-sm border-2 border-white dark:border-gray-900",
                  "transform translate-x-1/2 -translate-y-1/2",
                  "transition-all duration-200",
                  unreadCount > 9 && "px-2",
                )}
              >
                {unreadCount > 99
                  ? "99+"
                  : unreadCount > 9
                    ? "9+"
                    : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      deleteAllNotices(undefined, {
                        onSuccess: () => {
                          setNotifications([]);
                          setUnreadCount(0);
                        },
                      });
                    }}
                    className="text-xs text-blue-500 hover:text-blue-600"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div
                className="max-h-[300px] overflow-y-auto"
                ref={scrollContainerRef}
              >
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notif, index) => (
                      <div
                        key={index}
                        onClick={() => handleReadNotice(notif)}
                        className={`group p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer last:border-0 relative ${
                          !notif.isRead ? "bg-blue-50/50" : ""
                        }`}
                      >
                        {!notif.isRead && (
                          <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500"></span>
                        )}
                        <p
                          className={`text-sm text-gray-800 mb-1 ${!notif.isRead ? "font-semibold" : "font-medium"}`}
                        >
                          {notif.message}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <Badge
                            variant={
                              notif.status === "PUBLISHED"
                                ? "default"
                                : notif.status === "REJECTED"
                                  ? "destructive"
                                  : "secondary"
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
                        <button
                          onClick={(e) => handleDeleteNotice(e, notif.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {/* Infinite Scroll Sentinel */}
                    <div ref={observerRef} className="h-4 w-full" />
                    {isFetchingNextPage && (
                      <div className="p-2 text-center text-xs text-gray-500">
                        Loading more...
                      </div>
                    )}
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
