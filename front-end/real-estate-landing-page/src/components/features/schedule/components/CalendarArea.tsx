import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { memo, useCallback, useRef, useState } from "react";
import type { EventClickArgs } from "../dto/schedule.dto";
import EventDialog from "./EventDialog";
import { renderEventContent } from "./EventItem";

const CalendarArea = ({
  filteredEvents,
  handleDateClick,
  handleDatesSet,
  isVi,
}: {
  filteredEvents: any[];
  handleDateClick: (info: any) => void;
  handleDatesSet: (dateInfo: any) => void;
  isVi: boolean;
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventClickArgs | null>(
    null,
  );

  const handleEventClick = (info: any) => {
    setOpen(true);
    console.log(info.event);
    setSelectedEvent(info.event);
    // setModalOpen(true);
  };

  console.log("first");

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-1 overflow-hidden calendar-wrapper">
      <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          buttonText={{
            today: isVi ? "Hôm nay" : "Today",
            month: isVi ? "Tháng" : "Month",
            week: isVi ? "Tuần" : "Week",
            day: isVi ? "Ngày" : "Day",
            list: isVi ? "Danh sách" : "List",
          }}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={3}
          weekends={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={handleDatesSet} // Fetch data on view change
          events={filteredEvents.map((e: any) => {
            // Destructure out FullCalendar reserved props that conflict
            const { date: _date, startTime: _st, endTime: _et, ...rest } = e;
            return {
              ...rest,
              backgroundColor: "transparent",
              borderColor: "transparent",
              textColor: "#1f2937",
            };
          })}
          eventContent={(eventInfo: any) =>
            renderEventContent(eventInfo, filteredEvents)
          }
          height="100%"
          slotLabelClassNames="text-xs text-gray-400 font-medium"
          dayHeaderClassNames="text-sm font-semibold text-gray-600 py-4 uppercase tracking-wide"
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5, 6],
            startTime: "08:00",
            endTime: "19:00",
          }}
          nowIndicator={true}
          allDaySlot={false}
        />
        <EventDialog
          open={open}
          onClose={handleClose}
          id={selectedEvent?._def.publicId || ""}
      />
    </div>
  );
};

export default memo(CalendarArea);
