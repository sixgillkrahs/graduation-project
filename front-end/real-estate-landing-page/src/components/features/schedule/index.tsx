"use client";

import { CsButton } from "@/components/custom";
import { cn } from "@/lib/utils";
import { addHours, format, isSameDay } from "date-fns";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Inbox,
  Mail,
  MapPin,
  Phone,
  Plus,
  User,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import CalendarArea from "./components/CalendarArea";
import { SCHEDULE_STATUS, SCHEDULE_TYPE } from "./dto/schedule.dto";
import { reducer } from "./hooks/useReduce";
import { useGetSchedulesMe } from "./services/query";
import { useUpdateSchedule } from "./services/mutation";
import { toast } from "sonner";

/** Convert "10:00 AM" / "02:00 PM" to "10:00" / "14:00". Already-24h strings pass through. */
const parseTo24h = (time: string): string => {
  if (!time) return "";
  const trimmed = time.trim().toUpperCase();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return time; // already HH:mm
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3];
  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
};

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
  const { mutateAsync: updateSchedule, isPending: isUpdating } =
    useUpdateSchedule();

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
                startTimeStr = parseTo24h(s.startTime || "");
                endTimeStr = parseTo24h(s.endTime || "");
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
                customerPhone: s.customerPhone,
                customerEmail: s.customerEmail,
                description: s.customerNote,
                color: s.color,
                customerNote: s.customerNote,
                agentNote: s.agentNote,
                date: s.date || dateStr,
                startTime: s.startTime || startTimeStr,
                endTime: s.endTime || endTimeStr,
                userId: s.userId,
                isCustomerRequest: !!s.userId,
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

  const handleApprove = async (event: any) => {
    try {
      await updateSchedule({
        id: event.id,
        data: {
          title: event.title,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          type: event.type,
          status: SCHEDULE_STATUS.CONFIRMED,
          customerName: event.customerName,
          customerPhone: event.customerPhone,
          customerEmail: event.customerEmail,
          customerNote: event.customerNote,
          agentNote: event.agentNote || "",
          color: event.color,
        } as any,
      });
      toast.success("Schedule confirmed successfully and email sent!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to confirm schedule.");
    }
  };

  const handleReject = async (event: any) => {
    try {
      await updateSchedule({
        id: event.id,
        data: {
          title: event.title,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          type: event.type,
          status: SCHEDULE_STATUS.CANCELLED,
          customerName: event.customerName,
          customerPhone: event.customerPhone,
          customerEmail: event.customerEmail,
          customerNote: event.customerNote,
          agentNote: event.agentNote || "",
          color: event.color,
        } as any,
      });
      toast.success("Schedule cancelled successfully.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to cancel schedule.");
    }
  };

  const pendingRequests = dailyEvents.filter(
    (e: any) => e.isCustomerRequest && e.status === SCHEDULE_STATUS.PENDING,
  );
  const mySchedules = dailyEvents.filter((e: any) => !e.isCustomerRequest);
  const handledRequests = dailyEvents.filter(
    (e: any) => e.isCustomerRequest && e.status !== SCHEDULE_STATUS.PENDING,
  );

  const renderEventCard = (event: any) => {
    const isPending = event.status === SCHEDULE_STATUS.PENDING;
    const isCustomerReq = event.isCustomerRequest;

    const statusConfig: Record<
      string,
      { label: string; color: string; bg: string; border: string }
    > = {
      [SCHEDULE_STATUS.CONFIRMED]: {
        label: "Đã xác nhận",
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
      },
      [SCHEDULE_STATUS.CANCELLED]: {
        label: "Đã từ chối",
        color: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-200",
      },
      [SCHEDULE_STATUS.COMPLETED]: {
        label: "Hoàn thành",
        color: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-200",
      },
      [SCHEDULE_STATUS.PENDING]: {
        label: "Chờ duyệt",
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
      },
    };
    const status =
      statusConfig[event.status] || statusConfig[SCHEDULE_STATUS.PENDING];

    const stripColor =
      event.status === SCHEDULE_STATUS.CONFIRMED
        ? "#10b981"
        : event.status === SCHEDULE_STATUS.CANCELLED
          ? "#ef4444"
          : event.status === SCHEDULE_STATUS.COMPLETED
            ? "#3b82f6"
            : "#f59e0b";

    return (
      <div
        key={event.id}
        className={cn(
          "rounded-xl border transition-all relative overflow-hidden",
          isCustomerReq && isPending
            ? "bg-white border-amber-200 shadow-md ring-1 ring-amber-100"
            : "bg-white border-gray-200 shadow-sm hover:shadow-md",
        )}
      >
        {/* Left color strip */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
          style={{ backgroundColor: stripColor }}
        />

        <div className="p-3.5 pl-4">
          {/* Row 1: Time + Status */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-800">
                {format(new Date(event.start), "HH:mm")}
              </span>
              <span className="text-[10px] text-gray-400">•</span>
              <span className="text-[10px] text-gray-500 uppercase font-medium">
                {event.type}
              </span>
            </div>
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                status.color,
                status.bg,
                status.border,
              )}
            >
              {status.label}
            </span>
          </div>

          {/* Row 2: Title */}
          <h4 className="text-sm font-bold text-gray-900 mb-2 leading-snug">
            {event.title}
          </h4>

          {/* Row 3: Meta grid */}
          <div className="grid grid-cols-1 gap-1">
            {event.customerName && (
              <div className="flex items-center gap-1.5 text-xs">
                <User size={11} className="text-gray-400 shrink-0" />
                <span className="text-gray-700 font-medium truncate">
                  {event.customerName}
                </span>
              </div>
            )}
            {event.customerPhone && (
              <div className="flex items-center gap-1.5 text-xs">
                <Phone size={11} className="text-gray-400 shrink-0" />
                <span className="text-gray-600 truncate">
                  {event.customerPhone}
                </span>
              </div>
            )}
            {event.customerEmail && (
              <div className="flex items-center gap-1.5 text-xs">
                <Mail size={11} className="text-gray-400 shrink-0" />
                <span className="text-gray-600 truncate">
                  {event.customerEmail}
                </span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-1.5 text-xs">
                <MapPin size={11} className="text-gray-400 shrink-0" />
                <span className="text-gray-600 truncate">{event.location}</span>
              </div>
            )}
          </div>

          {/* Customer note */}
          {event.customerNote && (
            <div className="mt-2.5 bg-slate-50 rounded-lg px-3 py-2 text-xs text-gray-600 border border-slate-100">
              <span className="text-gray-400 font-medium">Ghi chú: </span>
              {event.customerNote}
            </div>
          )}

          {/* Actions: only for customer pending requests */}
          {isCustomerReq && isPending && (
            <div className="mt-3 flex gap-2">
              <button
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
                disabled={isUpdating}
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove(event);
                }}
              >
                <CheckCircle2 size={14} />
                Chấp nhận
              </button>
              <button
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-white text-red-600 text-xs font-bold hover:bg-red-50 active:scale-[0.98] border border-red-200 transition-all disabled:opacity-50"
                disabled={isUpdating}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject(event);
                }}
              >
                <XCircle size={14} />
                Từ chối
              </button>
            </div>
          )}

          {/* Confirmed message */}
          {event.status === SCHEDULE_STATUS.CONFIRMED && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
              <CheckCircle2 size={12} />
              Email xác nhận đã gửi
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-5 p-6 animate-in fade-in duration-500 bg-gray-50/50 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Quản lý lịch hẹn
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Hôm nay bạn có{" "}
            <span className="font-semibold text-gray-900">
              {dailyEvents.length} lịch hẹn
            </span>
            {pendingRequests.length > 0 && (
              <>
                , trong đó{" "}
                <span className="font-semibold text-amber-600">
                  {pendingRequests.length} yêu cầu
                </span>{" "}
                chờ duyệt
              </>
            )}
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
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              Tất cả
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
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <MapPin size={12} /> Xem nhà
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
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <User size={12} /> Họp
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
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <Phone size={12} /> Gọi
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-5 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[380px] shrink-0 flex flex-col gap-4 overflow-hidden">
          {/* Date Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gray-900 flex flex-col items-center justify-center text-white shrink-0">
              <span className="text-lg font-black leading-none">
                {format(selectedDateObj, "dd")}
              </span>
              <span className="text-[10px] uppercase font-medium tracking-wider opacity-80">
                {format(selectedDateObj, "MMM")}
              </span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {format(selectedDateObj, "EEEE")}
              </h2>
              <p className="text-xs text-gray-500">
                {format(selectedDateObj, "dd MMMM yyyy")}
              </p>
            </div>
          </div>

          {/* Scrollable event list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-1">
            {/* Section: Pending customer requests */}
            {pendingRequests.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                    <Inbox size={11} className="text-amber-600" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Yêu cầu đặt lịch ({pendingRequests.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {pendingRequests.map(renderEventCard)}
                </div>
              </div>
            )}

            {/* Section: Handled requests */}
            {handledRequests.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                    <CheckCircle2 size={11} className="text-gray-500" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Đã xử lý ({handledRequests.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {handledRequests.map(renderEventCard)}
                </div>
              </div>
            )}

            {/* Section: My schedules */}
            {mySchedules.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <CalendarIcon size={11} className="text-blue-600" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Lịch của tôi ({mySchedules.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {mySchedules.map(renderEventCard)}
                </div>
              </div>
            )}

            {/* Empty state */}
            {dailyEvents.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <CalendarIcon className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-400">
                  Không có lịch hẹn
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Ngày này chưa có sự kiện nào
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Calendar */}
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
