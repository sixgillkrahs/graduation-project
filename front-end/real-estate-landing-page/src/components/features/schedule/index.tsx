"use client";

import { CsButton } from "@/components/custom";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Plus } from "lucide-react";
import { useState } from "react";
import EventModal, { IEvent } from "./components/EventModal";

const Schedule = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const handleDateClick = (info: any) => {
    setSelectedEvent(null);
    setSelectedDate(info.dateStr);
    setModalOpen(true);
  };

  const handleEventClick = (info: any) => {
    const event = events.find((e) => e.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
      setModalOpen(true);
    }
  };

  const handleSaveEvent = (newEvent: IEvent) => {
    setEvents((prev) => {
      const exists = prev.find((e) => e.id === newEvent.id);
      if (exists) {
        return prev.map((e) => (e.id === newEvent.id ? newEvent : e));
      }
      return [...prev, newEvent];
    });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "#3b82f6";
      case "viewing":
        return "#10b981";
      case "deadline":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-500 text-sm">
            Manage your appointments and events
          </p>
        </div>
        <CsButton
          icon={<Plus size={18} />}
          onClick={() => {
            setSelectedEvent(null);
            setSelectedDate(new Date().toISOString().split("T")[0]);
            setModalOpen(true);
          }}
        >
          Add Event
        </CsButton>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-hidden calendar-wrapper">
        <FullCalendar
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
          dayMaxEvents={true}
          weekends={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          events={events.map((e) => ({
            ...e,
            backgroundColor: getEventColor(e.type),
            borderColor: getEventColor(e.type),
          }))}
          height="100%"
          eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
        />
      </div>

      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialDate={selectedDate}
        selectedEvent={selectedEvent}
      />

      <style jsx global>{`
        .calendar-wrapper .fc {
          font-family: inherit;
        }
        .calendar-wrapper .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        /* Toolbar Container styling to match Tabs container */
        // .calendar-wrapper .fc-button-group {
        //   background-color: #f3f4f6; /* cs-bg-gray */
        //   border-radius: 9999px; /* rounded-full */
        //   padding: 4px; /* p-1 */
        //   gap: 4px; /* gap-1 */
        //   display: inline-flex;
        //   align-items: center;
        //   margin-left: 0 !important; /* Reset default FullCalendar margin */
        // }

        /* Reset default button styles */
        .calendar-wrapper .fc-button-primary {
          background-color: transparent;
          border-color: transparent;
          color: #000; /* text-black */
          box-shadow: none !important;
          background-image: none !important;
          text-shadow: none !important;

          /* Typography */
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          text-transform: capitalize;

          /* Spacing & Shape */
          padding: 6px 16px; /* px-4 py-2 */
          border-radius: 9999px !important; /* rounded-full */
          transition: all 0.2s ease;
          margin: 0 !important; /* Reset margins */
        }

        /* Hover State */
        .calendar-wrapper .fc-button-primary:hover {
          background-color: transparent;
          border-color: transparent;
          color: #4b5563; /* hover:text-gray-600 */
        }

        /* Active State - white text on black background */
        .calendar-wrapper .fc-button-primary:not(:disabled).fc-button-active,
        .calendar-wrapper .fc-button-primary:not(:disabled):active {
          background-color: #000 !important; /* cs-bg-black */
          border-color: #000 !important;
          color: #fff !important; /* text-white */
        }

        /* Focus state removal */
        .calendar-wrapper .fc-button-primary:focus {
          box-shadow: none !important;
        }

        /* Today Button - Make it distinct or keep consistent */
        .calendar-wrapper .fc-today-button {
          opacity: 1;
          font-weight: 600;
        }

        /* Navigation Arrows (Prev/Next) */
        .calendar-wrapper .fc-prev-button,
        .calendar-wrapper .fc-next-button {
          padding: 6px 10px;
        }

        .calendar-wrapper .fc-daygrid-day.fc-day-today {
          background-color: rgba(240, 248, 255, 0.4);
        }
      `}</style>
    </div>
  );
};

export default Schedule;
