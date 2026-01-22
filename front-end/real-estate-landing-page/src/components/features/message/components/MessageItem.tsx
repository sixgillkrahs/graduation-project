import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatChatTime } from "@/shared/helper/formatChatTime";
import { CheckCheck } from "lucide-react";

const MessageItem = ({
  title,
  message,
  avatar,
  time,
  isRead = false,
  onClick,
}: {
  title: string;
  message: string;
  avatar?: string;
  time: string;
  isRead?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      className="flex justify-between items-start cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-2xl px-3 py-2 my-1"
      onClick={onClick}
    >
      <div className="flex gap-2">
        <Avatar className="w-10 h-10">
          <AvatarImage src={avatar} alt={title} className="grayscale" />
          <AvatarFallback>
            {title
              .trim()
              .split(/\s+/)
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
          <AvatarBadge className="bg-green-600 dark:bg-green-800" />
        </Avatar>
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{message}</div>
        </div>
      </div>
      <div className="grid gap-2">
        <div className="text-xs text-gray-500">{formatChatTime(time)}</div>
        <div className="w-4 h-4 flex items-center justify-center">
          <CheckCheck
            className={cn("w-4 h-4 ", isRead ? "text-green-600" : "opacity-50")}
          />
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
