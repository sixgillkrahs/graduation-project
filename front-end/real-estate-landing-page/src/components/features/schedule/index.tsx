"use client";

import { CsButton } from "@/components/custom";
import { cn } from "@/lib/utils";
import { addHours, format, isSameDay } from "date-fns";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Plus,
  User,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import CalendarArea from "./components/CalendarArea";
import { SCHEDULE_STATUS, SCHEDULE_TYPE } from "./dto/schedule.dto";
import { reducer } from "./hooks/useReduce";
import { useGetSchedulesMe } from "./services/query";

const Schedule = () => {
  const [state, dispatch] = useReducer(reducer, {
    events: [],
    filterType: "ALL",
  });
  const [currentRange, setCurrentRange] = useState<{
    start: string;
    end: string;
  }>();

  const { data: schedulesData } = useGetSchedulesMe(currentRange);

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const selectedDateObj = new Date(selectedDate);

  useEffect(() => {
    if (schedulesData?.data) {
      const rawEvents = schedulesData.data.page || schedulesData.data;
      if (Array.isArray(rawEvents)) {
        const mappedEvents: any[] = rawEvents
          .map((s: any) => {
            try {
              let dateStr = "";
              let startTimeStr = "";
              let endTimeStr = "";

              if (s.date) {
                dateStr = format(new Date(s.date), "yyyy-MM-dd");
                startTimeStr = s.startTime || "";
                endTimeStr = s.endTime || "";
              } else if (
                s.startTime &&
                (s.startTime.includes("T") || s.startTime.length > 8)
              ) {
                const startD = new Date(s.startTime);
                const endD = s.endTime
                  ? new Date(s.endTime)
                  : addHours(startD, 1);
                dateStr = format(startD, "yyyy-MM-dd");
                startTimeStr = format(startD, "HH:mm");
                endTimeStr = format(endD, "HH:mm");
              } else {
                return null;
              }

              if (
                startTimeStr &&
                startTimeStr.length < 5 &&
                startTimeStr.includes(":")
              ) {
                startTimeStr = `0${startTimeStr}`.slice(-5);
              }
              if (
                endTimeStr &&
                endTimeStr.length < 5 &&
                endTimeStr.includes(":")
              ) {
                endTimeStr = `0${endTimeStr}`.slice(-5);
              }

              if (!dateStr || !startTimeStr) return null;

              const fullStart = `${dateStr}T${startTimeStr}`;
              const fullEnd = `${dateStr}T${endTimeStr}`;

              return {
                id: s.id,
                title: s.title,
                start: fullStart,
                end: fullEnd,
                type: s.type,
                status: s.status,
                location: s.location,
                customerName: s.customerName,
                description: s.customerNote,
                color: s.color,
              };
            } catch (err) {
              return null;
            }
          })
          .filter(Boolean) as any[];
        dispatch({ type: "SET_EVENTS", payload: mappedEvents });
      }
    }
  }, [schedulesData]);

  const handleDatesSet = useCallback((dateInfo: any) => {
    setCurrentRange({
      start: dateInfo.startStr,
      end: dateInfo.endStr,
    });
  }, []);

  const filteredEvents = useMemo(() => {
    return state.events.filter(
      (e: any) => state.filterType === "ALL" || e.type === state.filterType,
    );
  }, [state.events, state.filterType]);

  const dailyEvents = filteredEvents.filter((e: any) =>
    isSameDay(new Date(e.start), selectedDateObj),
  );

  const handleDateClick = useCallback((info: any) => {
    setSelectedDate(info.dateStr);
  }, []);

  return (
    <div className="h-full flex flex-col gap-6 p-6 animate-in fade-in duration-500 bg-gray-50/50 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Agent Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back! You have{" "}
            <span className="font-semibold text-blue-600">
              {dailyEvents.length} events
            </span>{" "}
            today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Pills */}
          <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={() =>
                dispatch({ type: "SET_FILTER_TYPE", payload: "ALL" })
              }
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                state.filterType === "ALL"
                  ? "bg-gray-100 text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              All
            </button>
            <button
              onClick={() =>
                dispatch({
                  type: "SET_FILTER_TYPE",
                  payload: SCHEDULE_TYPE.VIEWING,
                })
              }
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1",
                state.filterType === SCHEDULE_TYPE.VIEWING
                  ? "bg-emerald-50 text-emerald-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <MapPin size={12} /> Viewings
            </button>
            <button
              onClick={() =>
                dispatch({
                  type: "SET_FILTER_TYPE",
                  payload: SCHEDULE_TYPE.MEETING,
                })
              }
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1",
                state.filterType === SCHEDULE_TYPE.MEETING
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <User size={12} /> Meetings
            </button>
            <button
              onClick={() =>
                dispatch({
                  type: "SET_FILTER_TYPE",
                  payload: SCHEDULE_TYPE.CALL,
                })
              }
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1",
                state.filterType === SCHEDULE_TYPE.CALL
                  ? "bg-amber-50 text-amber-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <Phone size={12} /> Calls
            </button>
          </div>

          <CsButton
            icon={<Plus size={16} />}
            // onClick={() => {
            //   setModalOpen(true);
            // }}
            className="shadow-md hover:shadow-lg transition-all bg-gray-900 text-white hover:bg-gray-800"
          >
            New Schedule
          </CsButton>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Sidebar: Daily Briefing */}
        <div className="w-[320px] shrink-0 flex flex-col gap-6">
          {/* Day Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CalendarIcon size={100} className="text-blue-600 rotate-12" />
            </div>
            <h2 className="text-lg font-semibold text-gray-600 uppercase tracking-wider z-10">
              {format(selectedDateObj, "EEEE")}
            </h2>
            <p className="text-6xl font-black text-gray-900 my-2 z-10 tracking-tighter">
              {format(selectedDateObj, "dd")}
            </p>
            <p className="text-blue-600 font-medium text-lg z-10">
              {format(selectedDateObj, "MMMM yyyy")}
            </p>
          </div>

          {/* Timeline List */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-0 flex flex-col min-h-0 overflow-hidden">
            <div className="p-3 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Clock size={16} className="text-gray-400" /> Daily Agenda
              </h3>
              <CsButton
                icon={<Plus size={16} />}
                // onClick={() => {
                //   setSelectedEvent(null);
                //   setModalOpen(true);
                // }}
                className="shadow-md hover:shadow-lg transition-all bg-gray-900 text-white hover:bg-gray-800"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
              {dailyEvents.length > 0 ? (
                dailyEvents
                  .sort(
                    (a: any, b: any) =>
                      new Date(a.start).getTime() - new Date(b.start).getTime(),
                  )
                  .map((event: any, index: number) => {
                    const isLast = index === dailyEvents.length - 1;
                    const statusColor =
                      event.status === SCHEDULE_STATUS.CONFIRMED
                        ? "text-emerald-500"
                        : event.status === SCHEDULE_STATUS.CANCELLED
                          ? "text-red-500"
                          : event.status === SCHEDULE_STATUS.COMPLETED
                            ? "text-blue-500"
                            : "text-amber-500";

                    return (
                      <div key={event.id} className="flex gap-3 group">
                        <div className="flex flex-col items-center min-w-[45px]">
                          <span className="text-xs font-bold text-gray-900">
                            {format(new Date(event.start), "HH:mm")}
                          </span>
                          {!isLast && (
                            <div className="w-0.5 flex-1 bg-gray-100 my-1 group-hover:bg-blue-100 transition-colors"></div>
                          )}
                        </div>

                        <div
                          className="flex-1 bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
                          // onClick={() => {
                          //   calendarRef.current?.getApi().gotoDate(event.start);
                          //   setSelectedEvent(event);
                          //   setModalOpen(true);
                          // }}
                        >
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1"
                            // style={{
                            //   backgroundColor:
                            //     event.color || getEventColor(event.type),
                            // }}
                          />
                          <div className="pl-2">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                                {event.title}
                              </h4>
                              {event.status === SCHEDULE_STATUS.CONFIRMED && (
                                <CheckCircle2
                                  size={14}
                                  className="text-emerald-500 shrink-0"
                                />
                              )}
                            </div>

                            <div className="space-y-1">
                              {event.customerName && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                  <User size={12} className="text-gray-400" />
                                  <span className="truncate">
                                    {event.customerName}
                                  </span>
                                </div>
                              )}
                              {event.location && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                  <MapPin size={12} className="text-gray-400" />
                                  <span className="truncate">
                                    {event.location}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <span
                                className={cn(
                                  "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-50 uppercase tracking-wide",
                                  statusColor,
                                )}
                              >
                                {event.status || "PENDING"}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                {event.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 opacity-60">
                  <CalendarIcon className="w-12 h-12 text-gray-200 mb-3" />
                  <p className="text-sm font-medium">No events for this day</p>
                  <p className="text-xs mt-1">Free time to find new leads!</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <CalendarArea
          filteredEvents={filteredEvents}
          handleDateClick={handleDateClick}
          handleDatesSet={handleDatesSet}
        />
      </div>
    </div>
  );
};

export default Schedule;
