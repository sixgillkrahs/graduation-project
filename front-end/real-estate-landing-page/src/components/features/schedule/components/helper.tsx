import { cn } from "@/lib/utils";
import { SCHEDULE_TYPE } from "../dto/schedule.dto";
import { CalendarIcon, MapPin, Phone, User } from "lucide-react";

export const getEventColor = (type: string) => {
  switch (type) {
    case SCHEDULE_TYPE.MEETING:
      return "#3b82f6"; // Blue
    case SCHEDULE_TYPE.VIEWING:
      return "#10b981"; // Emerald
    case SCHEDULE_TYPE.CALL:
      return "#f59e0b"; // Amber
    default:
      return "#6b7280"; // Gray
  }
};

export const getEventIcon = (type: string, className?: string) => {
  const props = { className: cn("w-4 h-4", className) };
  switch (type) {
    case SCHEDULE_TYPE.VIEWING:
      return <MapPin {...props} />;
    case SCHEDULE_TYPE.MEETING:
      return <User {...props} />; // Face to face
    case SCHEDULE_TYPE.CALL:
      return <Phone {...props} />;
    default:
      return <CalendarIcon {...props} />;
  }
};
