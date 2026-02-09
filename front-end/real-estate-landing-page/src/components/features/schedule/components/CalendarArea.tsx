import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { memo, useCallback, useRef, useState } from "react";
import { renderEventContent } from "./EventItem";
import EventDialog from "./EventDialog";
import { EventClickArgs } from "../dto/schedule.dto";

const CalendarArea = ({
  filteredEvents,
  handleDateClick,
  handleDatesSet,
}: {
  filteredEvents: any[];
  handleDateClick: (info: any) => void;
  handleDatesSet: (dateInfo: any) => void;
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
    <>
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
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={3}
          weekends={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={handleDatesSet} // Fetch data on view change
          events={filteredEvents.map((e: any) => ({
            ...e,
            backgroundColor: "transparent",
            borderColor: "transparent",
            textColor: "#1f2937",
          }))}
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
    </>
  );
};

export default memo(CalendarArea);
