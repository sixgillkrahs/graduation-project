"use client";

import { INoticeDto } from "@/components/layout/agent/dto/notice.dto";
import {
  useMarkAllNoticesRead,
  useReadNotice,
} from "@/components/layout/agent/services/mutate";
import { useGetMyNotices } from "@/components/layout/agent/services/query";
import { useSocket } from "@/components/features/message/services/socket-context";
import { cn } from "@/lib/utils";
import { Bell, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type NotificationBellProps = {
  isAuthenticated: boolean;
};

const mapPayloadToNotice = (payload: any): INoticeDto => ({
  id: payload.id || `notice-${Date.now()}`,
  userId: payload.userId || "",
  title: payload.title || "Thong bao moi",
  content: payload.message || payload.content || "",
  isRead: false,
  type: payload.type || "SYSTEM",
  metadata: payload.metadata,
  createdAt: payload.timestamp || new Date().toISOString(),
  updatedAt: payload.timestamp || new Date().toISOString(),
});

const NotificationBell = ({ isAuthenticated }: NotificationBellProps) => {
  const router = useRouter();
  const socket = useSocket();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [liveNotices, setLiveNotices] = useState<INoticeDto[]>([]);
  const [liveUnread, setLiveUnread] = useState(0);
  const { data, refetch } = useGetMyNotices({ page: 1, limit: 8 });
  const { mutate: readNotice } = useReadNotice();
  const { mutate: markAllAsRead, isPending: isMarkingAllRead } =
    useMarkAllNoticesRead();

  const notices = useMemo(() => {
    const fetched = data?.pages.flatMap((page) => page.data.results) || [];
    const merged = [...liveNotices, ...fetched];

    return merged
      .filter(
        (notice, index, list) =>
          list.findIndex((candidate) => candidate.id === notice.id) === index,
      )
      .slice(0, 8);
  }, [data, liveNotices]);

  const unreadCount = useMemo(() => {
    const baseUnread = Number((data?.pages?.[0]?.data as any)?.totalUnread || 0);
    return baseUnread + liveUnread;
  }, [data, liveUnread]);

  useEffect(() => {
    if (data?.pages?.length) {
      setLiveNotices([]);
      setLiveUnread(0);
    }
  }, [data]);

  useEffect(() => {
    if (!socket || !isAuthenticated) {
      return;
    }

    const handleNewNotification = (payload: any) => {
      const notice = mapPayloadToNotice(payload);

      setLiveNotices((current) => [notice, ...current]);
      setLiveUnread((current) => current + 1);
      refetch();
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("property_status_update", handleNewNotification);
    socket.on("schedule:new_request", handleNewNotification);
    socket.on("schedule:status_update", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("property_status_update", handleNewNotification);
      socket.off("schedule:new_request", handleNewNotification);
      socket.off("schedule:status_update", handleNewNotification);
    };
  }, [isAuthenticated, refetch, socket]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!isAuthenticated) {
    return null;
  }

  const handleOpenNotice = (notice: INoticeDto) => {
    if (!notice.isRead) {
      readNotice(notice.id);
      setLiveUnread((current) => Math.max(0, current - 1));
    }

    setIsOpen(false);

    const actionUrl = notice.metadata?.actionUrl as string | undefined;
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      return;
    }

    markAllAsRead(undefined, {
      onSuccess: () => {
        setLiveUnread(0);
        setLiveNotices((current) =>
          current.map((notice) => ({
            ...notice,
            isRead: true,
          })),
        );
      },
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative rounded-full border border-border bg-background p-2.5 text-muted-foreground transition hover:border-primary/30 hover:text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[22rem] overflow-hidden rounded-3xl border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <h3 className="text-sm font-semibold text-foreground">Thong bao</h3>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || isMarkingAllRead}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="size-3.5" />
              Danh dau tat ca da doc
            </button>
          </div>

          {notices.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              Chua co thong bao nao.
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notices.map((notice) => (
                <button
                  key={notice.id}
                  type="button"
                  onClick={() => handleOpenNotice(notice)}
                  className={cn(
                    "w-full border-b border-border/50 px-5 py-4 text-left transition hover:bg-muted/40",
                    !notice.isRead && "bg-primary/5",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {notice.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {notice.content}
                      </p>
                      {notice.metadata?.actionUrl && (
                        <span className="mt-3 inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          Danh gia ngay
                        </span>
                      )}
                    </div>
                    {!notice.isRead && (
                      <span className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
