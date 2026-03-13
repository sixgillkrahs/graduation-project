"use client";

import { CsButton } from "@/components/custom";
import StateSurface from "@/components/ui/state-surface";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/const/routes";
import { cn } from "@/lib/utils";
import { useGetMe } from "@/shared/auth/query";
import {
  addMonths,
  differenceInMinutes,
  endOfDay,
  format,
  startOfDay,
} from "date-fns";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CalendarSearch,
  CheckCircle2,
  CircleAlert,
  Clock3,
  MapPin,
  RefreshCw,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  IScheduleDTO,
  SCHEDULE_STATUS,
} from "../schedule/dto/schedule.dto";
import { useUpdateSchedule } from "../schedule/services/mutation";
import { useGetSchedulesMe } from "../schedule/services/query";

type AppointmentFilter =
  | "all"
  | "upcoming"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "expired"
  | "history";

type AppointmentItem = IScheduleDTO & {
  id: string;
  displayDate: Date;
  startDate: Date;
  endDate: Date;
  listingTitle: string;
  listingHref?: string;
  listingAddress?: string;
};

const parseTo24h = (time: string) => {
  const trimmed = time.trim().toUpperCase();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);

  if (!match) {
    return time;
  }

  let hours = Number(match[1]);
  const minutes = match[2];
  const period = match[3];

  if (period === "PM" && hours < 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${minutes}`;
};

const buildDateTime = (dateValue: Date | string, timeValue: string) => {
  const baseDate = new Date(dateValue);
  const [hours = "0", minutes = "0"] = parseTo24h(timeValue).split(":");
  const result = new Date(baseDate);

  result.setHours(Number(hours), Number(minutes), 0, 0);

  return result;
};

const addMinutesToClock = (timeValue: string, minutesToAdd: number) => {
  const [hours = "0", minutes = "0"] = parseTo24h(timeValue).split(":");
  const cursor = new Date();

  cursor.setHours(Number(hours), Number(minutes), 0, 0);
  cursor.setMinutes(cursor.getMinutes() + minutesToAdd);

  return `${String(cursor.getHours()).padStart(2, "0")}:${String(cursor.getMinutes()).padStart(2, "0")}`;
};

const getDurationMinutes = (appointment: AppointmentItem) => {
  const diff = differenceInMinutes(appointment.endDate, appointment.startDate);

  return diff > 0 ? diff : 60;
};

const getRawAppointments = (response: any): IScheduleDTO[] => {
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.results)) {
    return response.data.results;
  }

  if (Array.isArray(response?.data?.page)) {
    return response.data.page;
  }

  return [];
};

const getStatusTone = (status: SCHEDULE_STATUS) => {
  switch (status) {
    case SCHEDULE_STATUS.CONFIRMED:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case SCHEDULE_STATUS.CANCELLED:
      return "border-rose-200 bg-rose-50 text-rose-700";
    case SCHEDULE_STATUS.COMPLETED:
      return "border-sky-200 bg-sky-50 text-sky-700";
    case SCHEDULE_STATUS.EXPIRED:
      return "border-orange-200 bg-orange-50 text-orange-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
};

const getStatusLabel = (status: SCHEDULE_STATUS) => {
  switch (status) {
    case SCHEDULE_STATUS.CONFIRMED:
      return "Confirmed";
    case SCHEDULE_STATUS.CANCELLED:
      return "Cancelled";
    case SCHEDULE_STATUS.COMPLETED:
      return "Completed";
    case SCHEDULE_STATUS.EXPIRED:
      return "Expired";
    default:
      return "Pending";
  }
};

const getStatusMessage = (status: SCHEDULE_STATUS) => {
  switch (status) {
    case SCHEDULE_STATUS.CONFIRMED:
      return {
        title: "Confirmed by the agent",
        description:
          "Your viewing is locked in. Arrive on time and use the contact actions if you need to coordinate.",
        actionHint:
          "You can still reschedule or cancel before the appointment starts.",
        panelClassName: "border-emerald-200 bg-emerald-50 text-emerald-800",
        icon: CalendarClock,
      };
    case SCHEDULE_STATUS.CANCELLED:
      return {
        title: "Appointment cancelled",
        description:
          "This request has been cancelled and the time slot is no longer active.",
        actionHint:
          "If you still want to visit this property, open the listing and request a new appointment.",
        panelClassName: "border-rose-200 bg-rose-50 text-rose-800",
        icon: XCircle,
      };
    case SCHEDULE_STATUS.COMPLETED:
      return {
        title: "Viewing completed",
        description:
          "The appointment has finished successfully and is now archived in your history.",
        actionHint:
          "Check your email or notifications for any follow-up request such as leaving a review.",
        panelClassName: "border-sky-200 bg-sky-50 text-sky-800",
        icon: CheckCircle2,
      };
    case SCHEDULE_STATUS.EXPIRED:
      return {
        title: "Request expired",
        description:
          "This appointment window passed without an active confirmation, so it is no longer valid.",
        actionHint:
          "Choose another time and send a fresh request if you still want to visit.",
        panelClassName: "border-orange-200 bg-orange-50 text-orange-800",
        icon: Clock3,
      };
    default:
      return {
        title: "Waiting for agent confirmation",
        description:
          "Your request was sent successfully and is currently pending review from the agent.",
        actionHint:
          "You can still edit the time or cancel the request while it is pending.",
        panelClassName: "border-amber-200 bg-amber-50 text-amber-800",
        icon: CircleAlert,
      };
  }
};

const MyAppointments = () => {
  const router = useRouter();
  const { data: me } = useGetMe();
  const now = new Date();
  const [activeFilter, setActiveFilter] = useState<AppointmentFilter>("upcoming");
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentItem | null>(null);
  const [draftDate, setDraftDate] = useState("");
  const [draftTime, setDraftTime] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const { mutateAsync: updateSchedule, isPending: isUpdating } =
    useUpdateSchedule();

  const rangeStart = startOfDay(addMonths(now, -3)).toISOString();
  const rangeEnd = endOfDay(addMonths(now, 4)).toISOString();
  const { data, isLoading, isError, refetch } = useGetSchedulesMe({
    start: rangeStart,
    end: rangeEnd,
  });

  const appointments = getRawAppointments(data)
    .map((item) => {
      const listing =
        item.listingId && typeof item.listingId === "object" ? item.listingId : null;
      const displayDate = new Date(item.date);
      const startDate = buildDateTime(item.date, item.startTime);
      const endDate = buildDateTime(item.date, item.endTime);
      const listingId = listing?._id || listing?.id || item.listingId;

      return {
        ...item,
        id: item.id || (item as any)._id,
        displayDate,
        startDate,
        endDate,
        listingTitle: listing?.title || item.title || "Property appointment",
        listingHref: listingId ? ROUTES.PROPERTY_DETAIL(String(listingId)) : undefined,
        listingAddress: listing?.location?.address || item.location,
      } satisfies AppointmentItem;
    })
    .filter((item) => Boolean(item.id))
    .sort((left, right) => left.startDate.getTime() - right.startDate.getTime());

  const upcomingAppointments = appointments.filter(
    (item) =>
      item.endDate.getTime() >= now.getTime() &&
      item.status !== SCHEDULE_STATUS.CANCELLED &&
      item.status !== SCHEDULE_STATUS.COMPLETED &&
      item.status !== SCHEDULE_STATUS.EXPIRED,
  );
  const historyAppointments = appointments.filter(
    (item) =>
      item.endDate.getTime() < now.getTime() ||
      item.status === SCHEDULE_STATUS.CANCELLED ||
      item.status === SCHEDULE_STATUS.COMPLETED ||
      item.status === SCHEDULE_STATUS.EXPIRED,
  );
  const pendingCount = appointments.filter(
    (item) => item.status === SCHEDULE_STATUS.PENDING,
  ).length;
  const confirmedCount = appointments.filter(
    (item) => item.status === SCHEDULE_STATUS.CONFIRMED,
  ).length;
  const cancelledCount = appointments.filter(
    (item) => item.status === SCHEDULE_STATUS.CANCELLED,
  ).length;
  const completedCount = appointments.filter(
    (item) => item.status === SCHEDULE_STATUS.COMPLETED,
  ).length;
  const expiredCount = appointments.filter(
    (item) => item.status === SCHEDULE_STATUS.EXPIRED,
  ).length;

  const filteredAppointments = appointments.filter((item) => {
    if (activeFilter === "all") {
      return true;
    }

    if (activeFilter === "upcoming") {
      return upcomingAppointments.some((candidate) => candidate.id === item.id);
    }

    if (activeFilter === "pending") {
      return item.status === SCHEDULE_STATUS.PENDING;
    }

    if (activeFilter === "confirmed") {
      return item.status === SCHEDULE_STATUS.CONFIRMED;
    }

    if (activeFilter === "cancelled") {
      return item.status === SCHEDULE_STATUS.CANCELLED;
    }

    if (activeFilter === "completed") {
      return item.status === SCHEDULE_STATUS.COMPLETED;
    }

    if (activeFilter === "expired") {
      return item.status === SCHEDULE_STATUS.EXPIRED;
    }

    return historyAppointments.some((candidate) => candidate.id === item.id);
  });

  useEffect(() => {
    if (!selectedAppointment) {
      return;
    }

    setDraftDate(format(selectedAppointment.displayDate, "yyyy-MM-dd"));
    setDraftTime(parseTo24h(selectedAppointment.startTime));
    setDraftNote(selectedAppointment.customerNote || "");
  }, [selectedAppointment]);

  const hasDraftChanges = Boolean(
    selectedAppointment &&
      (draftDate !== format(selectedAppointment.displayDate, "yyyy-MM-dd") ||
        draftTime !== parseTo24h(selectedAppointment.startTime) ||
        draftNote.trim() !== (selectedAppointment.customerNote || "").trim()),
  );

  const handleCancel = async (appointment: AppointmentItem) => {
    const confirmed = window.confirm(
      "Cancel this appointment? The agent will be notified immediately.",
    );

    if (!confirmed) {
      return;
    }

    try {
      await updateSchedule({
        id: appointment.id,
        data: {
          title: appointment.title,
          date: appointment.displayDate,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          location: appointment.location,
          type: appointment.type,
          status: SCHEDULE_STATUS.CANCELLED,
          customerName: appointment.customerName,
          customerPhone: appointment.customerPhone,
          customerEmail: appointment.customerEmail,
          customerNote: appointment.customerNote || "",
          agentNote: appointment.agentNote || "",
          color: appointment.color,
        },
      });
      toast.success("Appointment cancelled.");
    } catch (error) {
      toast.error("Could not cancel this appointment.");
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment) {
      return;
    }

    if (!draftDate || !draftTime) {
      toast.error("Please choose a new date and time.");
      return;
    }

    const durationMinutes = getDurationMinutes(selectedAppointment);
    const nextDate = new Date(`${draftDate}T00:00:00`);
    const nextStartTime = parseTo24h(draftTime);
    const nextEndTime = addMinutesToClock(nextStartTime, durationMinutes);
    const nextStartDate = buildDateTime(nextDate, nextStartTime);

    if (nextStartDate.getTime() <= now.getTime()) {
      toast.error("The new appointment time must be in the future.");
      return;
    }

    try {
      await updateSchedule({
        id: selectedAppointment.id,
        data: {
          title: selectedAppointment.title,
          date: nextDate,
          startTime: nextStartTime,
          endTime: nextEndTime,
          location: selectedAppointment.location,
          type: selectedAppointment.type,
          status: SCHEDULE_STATUS.PENDING,
          customerName: selectedAppointment.customerName,
          customerPhone: selectedAppointment.customerPhone,
          customerEmail: selectedAppointment.customerEmail,
          customerNote: draftNote.trim(),
          agentNote: selectedAppointment.agentNote || "",
          color: selectedAppointment.color,
        },
      });
      toast.success("Reschedule request sent to the agent.");
      setSelectedAppointment(null);
    } catch (error) {
      toast.error("Could not send the reschedule request.");
    }
  };

  if (me?.data?.roleId?.code === "AGENT") {
    return (
      <section className="container mx-auto px-4 py-8 md:px-20">
        <div className="rounded-[32px] border border-border bg-card p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            Buyer Area
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            This page is for buyers and customers.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Your account is an agent account, so appointment management is handled
            in Agent Space.
          </p>
          <div className="mt-6">
            <Link href={ROUTES.AGENT_SCHEDULE}>
              <CsButton icon={<ArrowRight className="size-4" />}>
                Open Agent Schedule
              </CsButton>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8 md:px-20">
      <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              Customer Space
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
              My Appointments
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Review every viewing request you placed, cancel what no longer fits,
              or ask the agent for a new time slot.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[
              {
                label: "Pending",
                value: pendingCount,
                description: "Sent and waiting for agent confirmation",
                tone: "border-amber-200 bg-amber-50",
              },
              {
                label: "Confirmed",
                value: confirmedCount,
                description: "Agent approved the appointment",
                tone: "border-emerald-200 bg-emerald-50",
              },
              {
                label: "Cancelled",
                value: cancelledCount,
                description: "Cancelled by you or the agent",
                tone: "border-rose-200 bg-rose-50",
              },
              {
                label: "Completed",
                value: completedCount,
                description: "Viewing already happened",
                tone: "border-sky-200 bg-sky-50",
              },
              {
                label: "Expired",
                value: expiredCount,
                description: "Old request that is no longer valid",
                tone: "border-orange-200 bg-orange-50",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={cn("rounded-2xl border px-4 py-4", item.tone)}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  {item.value}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/10 px-5 py-4 text-sm text-[color:var(--color-text-primary)]">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <p>
              Rescheduling sends the appointment back to <strong>Pending</strong>{" "}
              so the agent can confirm the new time. Each appointment below also
              explains clearly what its current status means.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[32px] border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "upcoming", label: "Upcoming" },
              { key: "pending", label: "Pending" },
              { key: "confirmed", label: "Confirmed" },
              { key: "cancelled", label: "Cancelled" },
              { key: "completed", label: "Completed" },
              { key: "expired", label: "Expired" },
              { key: "history", label: "History" },
              { key: "all", label: "All" },
            ].map((item) => {
              const active = activeFilter === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveFilter(item.key as AppointmentFilter)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition",
                    active
                      ? "border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/10 text-[color:var(--color-text-primary)]"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </p>
        </div>

        {isLoading ? (
          <StateSurface
            className="mt-6"
            tone="brand"
            eyebrow="Appointments"
            icon={<CalendarClock className="h-6 w-6 animate-pulse" />}
            title="Loading your appointments"
            description="Collecting your upcoming visits, status updates, and viewing history."
          />
        ) : isError && appointments.length === 0 ? (
          <StateSurface
            className="mt-6"
            tone="danger"
            eyebrow="Appointments"
            icon={<AlertCircle className="h-6 w-6" />}
            title="Could not load appointments"
            description="The booking service is temporarily unavailable. Retry to restore your appointment timeline."
            primaryAction={{
              label: "Try again",
              onClick: () => {
                void refetch();
              },
            }}
          />
        ) : filteredAppointments.length === 0 ? (
          <StateSurface
            className="mt-6"
            tone="brand"
            eyebrow="Appointments"
            icon={<CalendarSearch className="h-6 w-6" />}
            title={
              appointments.length === 0
                ? "No appointments yet"
                : "No appointments in this view"
            }
            description={
              appointments.length === 0
                ? "Once you request a property viewing, it will appear here with status updates from the agent."
                : "Try another filter to review older bookings or upcoming visits."
            }
            primaryAction={{
              label:
                appointments.length === 0 ? "Browse properties" : "Show all",
              onClick: () => {
                if (appointments.length === 0) {
                  router.push(ROUTES.PROPERTIES);
                  return;
                }

                setActiveFilter("all");
              },
            }}
            secondaryAction={
              appointments.length === 0
                ? undefined
                : {
                    label: "Upcoming",
                    onClick: () => setActiveFilter("upcoming"),
                    variant: "outline",
                  }
            }
          />
        ) : (
          <div className="mt-6 grid gap-4">
            {filteredAppointments.map((appointment) => {
              const canManage =
                appointment.startDate.getTime() > now.getTime() &&
                appointment.status !== SCHEDULE_STATUS.CANCELLED &&
                appointment.status !== SCHEDULE_STATUS.COMPLETED &&
                appointment.status !== SCHEDULE_STATUS.EXPIRED;
              const statusMessage = getStatusMessage(appointment.status);
              const StatusIcon = statusMessage.icon;

              return (
                <article
                  key={appointment.id}
                  className="rounded-[28px] border border-border bg-background px-5 py-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={getStatusTone(appointment.status)}
                        >
                          {getStatusLabel(appointment.status)}
                        </Badge>
                        <Badge variant="outline">{appointment.type}</Badge>
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                          {appointment.listingTitle}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {appointment.title}
                        </p>
                      </div>

                      <div className="grid gap-2 text-sm text-foreground/80 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="size-4 text-muted-foreground" />
                          <span>
                            {format(appointment.displayDate, "EEEE, dd MMM yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 className="size-4 text-muted-foreground" />
                          <span>
                            {format(appointment.startDate, "HH:mm")} -{" "}
                            {format(appointment.endDate, "HH:mm")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <MapPin className="size-4 text-muted-foreground" />
                          <span>{appointment.listingAddress || appointment.location}</span>
                        </div>
                      </div>

                      {appointment.customerNote ? (
                        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                          {appointment.customerNote}
                        </div>
                      ) : null}

                      <div
                        className={cn(
                          "rounded-2xl border px-4 py-3",
                          statusMessage.panelClassName,
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <StatusIcon className="mt-0.5 size-4 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold">
                              {statusMessage.title}
                            </p>
                            <p className="mt-1 text-sm leading-6 opacity-90">
                              {statusMessage.description}
                            </p>
                            <p className="mt-2 text-xs font-medium opacity-80">
                              {statusMessage.actionHint}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex min-w-[240px] flex-col gap-2 xl:items-end">
                      {appointment.listingHref ? (
                        <Link href={appointment.listingHref}>
                          <CsButton
                            variant="secondary"
                            className="w-full bg-white! text-black xl:w-auto"
                            icon={<ArrowRight className="size-4" />}
                          >
                            View property
                          </CsButton>
                        </Link>
                      ) : null}

                      {canManage ? (
                        <div className="flex flex-col gap-2 sm:flex-row xl:flex-col xl:items-stretch">
                          <CsButton
                            type="button"
                            className="bg-white! text-black border border-black/10"
                            icon={<RefreshCw className="size-4" />}
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            Reschedule
                          </CsButton>
                          <CsButton
                            type="button"
                            className="bg-rose-600! text-white hover:opacity-95"
                            icon={<XCircle className="size-4" />}
                            onClick={() => handleCancel(appointment)}
                            loading={isUpdating}
                          >
                            Cancel
                          </CsButton>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                          {appointment.status === SCHEDULE_STATUS.CANCELLED
                            ? "Cancelled appointments are locked. Open the property again to place a new request."
                            : appointment.status === SCHEDULE_STATUS.COMPLETED
                              ? "Completed appointments are archived and can no longer be edited."
                              : appointment.status === SCHEDULE_STATUS.EXPIRED
                                ? "Expired requests cannot be edited. Pick a new slot from the property page."
                                : "This appointment can no longer be changed."}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(selectedAppointment)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAppointment(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Request a new appointment time</DialogTitle>
            <DialogDescription>
              Choose a new slot. The agent will receive a fresh request and needs
              to confirm it again.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                type="date"
                label="New date"
                min={format(now, "yyyy-MM-dd")}
                value={draftDate}
                onChange={(event) => setDraftDate(event.target.value)}
              />
              <Input
                type="time"
                label="New time"
                value={draftTime}
                onChange={(event) => setDraftTime(event.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Note for the agent
              </label>
              <Textarea
                rows={4}
                value={draftNote}
                onChange={(event) => setDraftNote(event.target.value)}
                placeholder="Share the reason or any new preference for the updated visit."
                className="rounded-2xl"
              />
            </div>
          </div>

          <DialogFooter>
            <CsButton
              type="button"
              className="bg-white! text-black border border-black/10"
              onClick={() => setSelectedAppointment(null)}
            >
              Close
            </CsButton>
            <CsButton
              type="button"
              icon={<CalendarClock className="size-4" />}
              onClick={handleReschedule}
              disabled={!hasDraftChanges}
              loading={isUpdating}
            >
              Send request
            </CsButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default MyAppointments;






