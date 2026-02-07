import { MapPin, User } from "lucide-react";
import { getEventColor, getEventIcon } from "./helper";

export const renderEventContent = (eventInfo: any, events: any[]) => {
  const event = events.find((e: any) => e.id === eventInfo.event.id);
  if (!event) return null;

  const isMonthView = eventInfo.view.type === "dayGridMonth";
  const color = event.color || getEventColor(event.type);

  return (
    <div className="w-full overflow-hidden">
      {isMonthView ? (
        <div className="flex items-center gap-1 px-1 py-0.5 text-xs truncate">
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="font-medium text-gray-700 truncate">
            {eventInfo.timeText} {event.title}
          </span>
        </div>
      ) : (
        <div
          className="flex flex-col h-full p-1 border-l-4 rounded-sm shadow-sm transition-all hover:brightness-95"
          style={{ borderLeftColor: color, backgroundColor: `${color}33` }}
        >
          <div className="font-bold text-xs text-gray-800 flex justify-between items-center">
            <span>{event.title}</span>
            {getEventIcon(event.type, "w-3 h-3 text-gray-500")}
          </div>
          {event.customerName && (
            <div className="text-[10px] text-gray-600 truncate mt-0.5 flex items-center gap-1">
              <User size={10} /> {event.customerName}
            </div>
          )}
          {event.location && (
            <div className="text-[10px] text-gray-500 truncate mt-auto flex items-center gap-1">
              <MapPin size={10} /> {event.location}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
