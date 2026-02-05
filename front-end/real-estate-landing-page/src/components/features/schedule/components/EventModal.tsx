import { CsButton } from "@/components/custom";
import { CsDialog } from "@/components/custom/dialog";
import { Icon, Tabs } from "@/components/ui";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { CsSelect } from "@/components/ui/select";
import { CsTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { addDays, format, set } from "date-fns";
import { memo, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import {
  CreateScheduleRequest,
  SCHEDULE_STATUS,
  SCHEDULE_TYPE,
} from "../dto/schedule.dto";
import { useCreateSchedule } from "../services/mutation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface IEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  description?: string;
  type: SCHEDULE_TYPE;
}

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
}

const SCHEDULE_TYPE_OPTIONS = [
  { label: "Viewing", value: SCHEDULE_TYPE.VIEWING },
  { label: "Meeting", value: SCHEDULE_TYPE.MEETING },
  { label: "Call", value: SCHEDULE_TYPE.CALL },
];

const SCHEDULE_STATUS_OPTIONS = [
  { label: "Pending", value: SCHEDULE_STATUS.PENDING },
  { label: "Confirmed", value: SCHEDULE_STATUS.CONFIRMED },
  { label: "Cancelled", value: SCHEDULE_STATUS.CANCELLED },
  { label: "Completed", value: SCHEDULE_STATUS.COMPLETED },
];

const TABS = [
  { title: "General Info", value: 0 },
  { title: "Customer", value: 1 },
  { title: "Notes", value: 2 },
];

const EventModal = memo(({ open, onClose, initialDate }: EventModalProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const { mutateAsync: createSchedule, isPending: createSchedulePending } =
    useCreateSchedule();

  const [date, setDate] = useState<DateRange | undefined>();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateScheduleRequest>({
    shouldUnregister: false,
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      startTime: new Date(),
      endTime: addDays(new Date(), 0),
      location: "",
      type: SCHEDULE_TYPE.VIEWING,
      status: SCHEDULE_STATUS.PENDING,
      customerNote: "",
      agentNote: "",
      title: "",
    },
  });

  const startTime = watch("startTime");
  const endTime = watch("endTime");

  useEffect(() => {
    if (open) {
      setActiveTab(0);
      // if (selectedEvent) {
      //   setValue("title", selectedEvent.title);
      //   const start = new Date(selectedEvent.start);
      //   const end = selectedEvent.end
      //     ? new Date(selectedEvent.end)
      //     : new Date(
      //         new Date(selectedEvent.start).setHours(start.getHours() + 1),
      //       );

      //   setValue("startTime", start);
      //   setValue("endTime", end);
      //   setValue("type", selectedEvent.type);

      //   setDate({ from: start, to: end });
      // } else {
      const start = initialDate ? new Date(initialDate) : new Date();
      const end = new Date(new Date(start).setHours(start.getHours() + 1));

      reset({
        title: "",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        startTime: start,
        endTime: end,
        location: "",
        type: SCHEDULE_TYPE.VIEWING,
        status: SCHEDULE_STATUS.PENDING,
        customerNote: "",
        agentNote: "",
      });
      setDate({ from: start, to: end });
      // }
    }
  }, [open, initialDate, reset, setValue]);

  const onDateRangeSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (range?.from) {
      const currentStart = startTime || new Date();
      const newStart = set(range.from, {
        hours: currentStart.getHours(),
        minutes: currentStart.getMinutes(),
      });
      setValue("startTime", newStart);

      if (range.to) {
        const currentEnd = endTime || new Date();
        const newEnd = set(range.to, {
          hours: currentEnd.getHours(),
          minutes: currentEnd.getMinutes(),
        });
        setValue("endTime", newEnd);
      } else {
        const currentEnd = endTime || new Date();
        const newEnd = set(range.from, {
          hours: currentEnd.getHours(),
          minutes: currentEnd.getMinutes(),
        });
        setValue("endTime", newEnd);
      }
    }
  };

  const onTimeChange = (type: "start" | "end", timeStr: string) => {
    if (!timeStr) return;
    const [hours, minutes] = timeStr.split(":").map(Number);

    if (type === "start") {
      const currentStart = startTime || new Date();
      const newStart = set(currentStart, { hours, minutes });
      setValue("startTime", newStart);

      const currentEnd = endTime || new Date();
      if (newStart >= currentEnd) {
        const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);
        setValue("endTime", newEnd);
      }
    } else {
      const currentEnd = endTime || new Date();
      const newEnd = set(currentEnd, { hours, minutes });
      setValue("endTime", newEnd);

      const currentStart = startTime || new Date();
      if (newEnd <= currentStart) {
        const newStart = new Date(newEnd.getTime() - 60 * 60 * 1000);
        setValue("startTime", newStart);
      }
    }
  };

  const onSubmit = async (data: CreateScheduleRequest) => {
    console.log("Submitting:", data);
    await createSchedule(data);
    onClose();
  };

  const onError = (errors: FieldErrors<CreateScheduleRequest>) => {
    if (
      errors.title ||
      errors.type ||
      errors.status ||
      errors.startTime ||
      errors.endTime ||
      errors.location
    ) {
      setActiveTab(0);
      return;
    }
    if (errors.customerName || errors.customerPhone || errors.customerEmail) {
      setActiveTab(1);
      return;
    }
    if (errors.customerNote || errors.agentNote) {
      setActiveTab(2);
      return;
    }
  };

  return (
    <CsDialog
      open={open}
      onOpenChange={onClose}
      title={"Add New Schedule"}
      okText="Save"
      cancelText="Cancel"
      onCancel={onClose}
      width={600}
      loading={createSchedulePending}
      footer={
        <div className="flex justify-between w-full pt-4 border-t border-gray-100">
          {/* {selectedEvent && onDelete ? (
            <CsButton
              className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
              onClick={() => {
                onDelete(selectedEvent.id);
                onClose();
              }}
              icon={<Icon.DeleteBin className="w-4 h-4 mr-2" />}
            >
              Delete
            </CsButton>
          ) : (
            <div />
          )} */}
          <div className="flex gap-3 justify-end w-full">
            <CsButton onClick={onClose}>Cancel</CsButton>
            <CsButton
              type="submit"
              form="form-event"
              className="bg-primary text-white shadow-lg hover:shadow-xl transition-all"
              loading={createSchedulePending}
            >
              Save Schedule
            </CsButton>
          </div>
        </div>
      }
    >
      <div className="flex justify-center mb-6">
        <Tabs items={TABS} current={activeTab} onChange={setActiveTab} />
      </div>

      <form
        className="flex flex-col gap-5 p-1 min-h-[300px]"
        onSubmit={handleSubmit(onSubmit, onError)}
        id="form-event"
      >
        {/* General Information */}
        <div
          className={
            activeTab === 0
              ? "block space-y-4 animate-in fade-in slide-in-from-left-4 duration-300"
              : "hidden"
          }
        >
          <Controller
            name="title"
            control={control}
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <Input
                label="Schedule Title"
                placeholder="e.g. Viewing Apartment A"
                error={errors.title?.message}
                preIcon={<Icon.Briefcase className="w-5 h-5 text-gray-400" />}
                {...field}
              />
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1.5 block">
                Date Range
              </label>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <CsButton
                      className={cn(
                        "w-full justify-start text-left font-normal border-gray-200",
                        !date && "text-muted-foreground",
                      )}
                      icon={<Icon.CalendarSchedule className="mr-2 h-4 w-4" />}
                    >
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </CsButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={onDateRangeSelect}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Time Pickers */}
            <Controller
              name="startTime"
              control={control}
              rules={{ required: "Start time is required" }}
              render={({ field }) => (
                <Input
                  label="Start Time"
                  type="time"
                  value={field.value ? format(field.value, "HH:mm") : ""}
                  onChange={(e) => onTimeChange("start", e.target.value)}
                  error={errors.startTime?.message}
                />
              )}
            />

            <Controller
              name="endTime"
              control={control}
              rules={{ required: "End time is required" }}
              render={({ field }) => (
                <Input
                  label="End Time"
                  type="time"
                  value={field.value ? format(field.value, "HH:mm") : ""}
                  onChange={(e) => onTimeChange("end", e.target.value)}
                  error={errors.endTime?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="type"
              control={control}
              rules={{ required: "Type is required" }}
              render={({ field }) => (
                <CsSelect
                  label="Type"
                  placeholder="Select type"
                  options={SCHEDULE_TYPE_OPTIONS}
                  error={errors.type?.message}
                  {...field}
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              rules={{ required: "Status is required" }}
              render={({ field }) => (
                <CsSelect
                  label="Status"
                  placeholder="Select status"
                  options={SCHEDULE_STATUS_OPTIONS}
                  error={errors.status?.message}
                  {...field}
                />
              )}
            />
          </div>

          <Controller
            name="location"
            control={control}
            rules={{ required: "Location is required" }}
            render={({ field }) => (
              <Input
                label="Location"
                placeholder="e.g. 123 Main St, Springfield"
                error={errors.location?.message}
                preIcon={<Icon.MapPin className="w-5 h-5 text-gray-400" />}
                {...field}
              />
            )}
          />
        </div>

        <div
          className={
            activeTab === 1
              ? "block space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
              : "hidden"
          }
        >
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Controller
                name="customerName"
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <Input
                    label="Customer Name"
                    placeholder="John Doe"
                    error={errors.customerName?.message}
                    preIcon={<Icon.User className="w-5 h-5 text-gray-400" />}
                    {...field}
                  />
                )}
              />
              <Controller
                name="customerPhone"
                control={control}
                rules={{ required: "Phone is required" }}
                render={({ field }) => (
                  <Input
                    label="Phone Number"
                    placeholder="0987654321"
                    error={errors.customerPhone?.message}
                    preIcon={<Icon.Phone className="w-5 h-5 text-gray-400" />}
                    {...field}
                  />
                )}
              />
            </div>
            <Controller
              name="customerEmail"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              render={({ field }) => (
                <Input
                  label="Email Address"
                  placeholder="john@example.com"
                  error={errors.customerEmail?.message}
                  preIcon={<Icon.Mail className="w-5 h-5 text-gray-400" />}
                  {...field}
                />
              )}
            />
          </div>
        </div>

        <div
          className={
            activeTab === 2
              ? "block space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
              : "hidden"
          }
        >
          <Controller
            name="customerNote"
            control={control}
            render={({ field }) => (
              <CsTextarea
                label="Customer Note"
                placeholder="Special requests..."
                error={errors.customerNote?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="agentNote"
            control={control}
            render={({ field }) => (
              <CsTextarea
                label="Internal Agent Note"
                placeholder="Private notes..."
                error={errors.agentNote?.message}
                {...field}
              />
            )}
          />
        </div>
      </form>
    </CsDialog>
  );
});

export default EventModal;
