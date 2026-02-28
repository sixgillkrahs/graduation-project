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
          {notification.metadata?.rejectReason && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-100 mb-4">
              <span className="font-semibold block mb-1 text-xs uppercase tracking-wider">
                Reject Reason
              </span>
              <span className="text-sm whitespace-pre-wrap">
                {notification.metadata.rejectReason}
              </span>
            </div>
          )}
          <div className="flex flex-col gap-2 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-2 border-t pt-2">
              <strong>Status:</strong>{" "}
              <Badge
                variant={
                  notification.metadata?.status === "PUBLISHED"
                    ? "default"
                    : notification.metadata?.status === "REJECTED"
                      ? "destructive"
                      : "secondary"
                }
                className="font-normal px-2 py-0 h-4 min-h-0 text-[10px]"
              >
                {notification.metadata?.status || notification.status}
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
