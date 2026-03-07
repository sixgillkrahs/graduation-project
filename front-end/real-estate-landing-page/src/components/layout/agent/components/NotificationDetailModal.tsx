import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";

export interface NotificationDetail {
  message: string;
  status: string;
  timestamp: string;
  propertyId?: string;
  isRead: boolean;
  type: string;
  id: string;
  metadata?: any;
}

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationDetail | null;
}

export const NotificationDetailModal: React.FC<
  NotificationDetailModalProps
> = ({ isOpen, onClose, notification }) => {
  if (!notification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[380px]" onCancel={onClose}>
        <DialogHeader>
          <DialogTitle className="text-base">Notification Details</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <p className="text-sm font-medium text-gray-800 leading-relaxed mb-4">
            {notification.message}
          </p>
          {notification.type === "SCHEDULE" && notification.metadata && (
            <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3 mb-4 space-y-2">
              <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-2">
                Chi tiết lịch hẹn
              </h4>

              {notification.metadata.customerName && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Khách hàng:</span>
                  <span className="font-semibold text-gray-700">
                    {notification.metadata.customerName}
                  </span>
                </div>
              )}

              {notification.metadata.date && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Ngày xem:</span>
                  <span className="font-semibold text-gray-700">
                    {notification.metadata.date}
                  </span>
                </div>
              )}

              {notification.metadata.startTime && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Thời gian:</span>
                  <span className="font-semibold text-gray-700">
                    {notification.metadata.startTime}{" "}
                    {notification.metadata.endTime
                      ? `- ${notification.metadata.endTime}`
                      : ""}
                  </span>
                </div>
              )}

              {notification.metadata.propertyTitle && (
                <div className="flex flex-col text-xs pt-1 border-t border-amber-100 mt-1">
                  <span className="text-gray-500 mb-0.5">Bất động sản:</span>
                  <span className="font-medium text-gray-700 italic">
                    "{notification.metadata.propertyTitle}"
                  </span>
                </div>
              )}
            </div>
          )}

          {notification.metadata?.rejectReason && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-100 mb-4">
              <span className="font-semibold block mb-1 text-xs uppercase tracking-wider">
                Lý do từ chối
              </span>
              <span className="text-sm whitespace-pre-wrap">
                {notification.metadata.rejectReason}
              </span>
            </div>
          )}
          <div className="flex flex-col gap-2 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-2 border-t pt-2">
              <strong>Trạng thái:</strong>{" "}
              <Badge
                variant={
                  notification.metadata?.status === "PUBLISHED" ||
                  notification.status === "CONFIRMED"
                    ? "default"
                    : notification.metadata?.status === "REJECTED" ||
                        notification.status === "CANCELLED"
                      ? "destructive"
                      : "secondary"
                }
                className="font-normal px-2 py-0 h-4 min-h-0 text-[10px]"
              >
                {notification.status === "PENDING"
                  ? "Chờ duyệt"
                  : notification.status === "CONFIRMED"
                    ? "Đã duyệt"
                    : notification.status === "CANCELLED"
                      ? "Đã hủy"
                      : notification.metadata?.status || notification.status}
              </Badge>
            </span>
            <span className="flex items-center gap-2">
              <strong>Date:</strong>{" "}
              {new Date(notification.timestamp).toLocaleString("vi-VN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        </div>
        <DialogFooter className="sm:justify-end mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs px-4"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
