import { CsButton } from "@/components/custom";
import { CsDialog } from "@/components/custom/dialog";
import { Icon, Tabs } from "@/components/ui";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import InputColor from "@/components/ui/input-color";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CsSelect } from "@/components/ui/select";
import { CsTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { memo, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import {
  CreateScheduleRequest,
  SCHEDULE_STATUS,
  SCHEDULE_TYPE,
} from "../dto/schedule.dto";
import {
  useCreateSchedule,
  useDeleteSchedule,
  useUpdateSchedule,
} from "../services/mutation";
import ScheduleService from "../services/service";
import { useGetScheduleById } from "../services/query";

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
  selectedEvent?: any;
}

const EventModal = memo(
  ({ open, onClose, initialDate, selectedEvent }: EventModalProps) => {
    const [activeTab, setActiveTab] = useState(0);
    const { mutateAsync: createSchedule, isPending: createSchedulePending } =
      useCreateSchedule();
    const { mutateAsync: updateSchedule, isPending: updateSchedulePending } =
      useUpdateSchedule();
    const { mutateAsync: deleteSchedule, isPending: deleteSchedulePending } =
      useDeleteSchedule();
    const { data: scheduleDetail, isLoading: isLoadingDetail } =
      useGetScheduleById(selectedEvent?.id || "");
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
        date: new Date(),
        startTime: "09:00",
        endTime: "10:00",
        location: "",
        type: SCHEDULE_TYPE.VIEWING,
        status: SCHEDULE_STATUS.PENDING,
        customerNote: "",
        agentNote: "",
        title: "",
        color: ScheduleService.EVENT_COLORS[0],
      },
    });

    useEffect(() => {
      if (open) {
        console.log(scheduleDetail?.data.status);
        if (scheduleDetail?.data) {
          reset({
            title: scheduleDetail?.data.title,
            color: scheduleDetail?.data.color,
            date: scheduleDetail?.data.date,
            startTime: scheduleDetail?.data.startTime,
            endTime: scheduleDetail?.data.endTime,
            location: scheduleDetail?.data.location,
            type: scheduleDetail?.data.type,
            status: scheduleDetail?.data.status as SCHEDULE_STATUS,
            customerNote: scheduleDetail?.data.customerNote,
            agentNote: scheduleDetail?.data.agentNote,
            customerName: scheduleDetail?.data.customerName,
            customerPhone: scheduleDetail?.data.customerPhone,
            customerEmail: scheduleDetail?.data.customerEmail,
          });
          setDate({
            from: scheduleDetail?.data.date,
            to: scheduleDetail?.data.date,
          });
        } else {
        }
      }
    }, [open, scheduleDetail?.data, reset]);

    const onDateRangeSelect = (range: DateRange | undefined) => {
      setDate(range);
      if (range?.from) {
        setValue("date", range.from);
      }
    };

    const onTimeChange = (type: "start" | "end", timeStr: string) => {
      if (!timeStr) return;
      if (type === "start") {
        setValue("startTime", timeStr);
      } else {
        setValue("endTime", timeStr);
      }
    };

    const onSubmit = async (data: CreateScheduleRequest) => {
      if (selectedEvent) {
        await updateSchedule({ id: selectedEvent.id, data });
      } else {
        await createSchedule(data);
      }
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
        loading={
          createSchedulePending || updateSchedulePending || isLoadingDetail
        }
        footer={
          <div className="flex justify-between w-full pt-4 border-t border-gray-100">
            <div>
              {selectedEvent && (
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="inline-block">
                      <CsButton
                        type="button"
                        variant="destructive"
                        loading={deleteSchedulePending}
                        className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                      >
                        Delete
                      </CsButton>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="flex flex-col gap-2">
                      <div className="space-y-1">
                        <h4 className="font-medium leading-none">
                          Delete Schedule?
                        </h4>
                        <p className="text-sm text-gray-500">
                          This action cannot be undone. Are you sure you want to
                          delete this schedule?
                        </p>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <CsButton
                          size="sm"
                          className="bg-red-600 text-white hover:bg-red-700 w-full"
                          onClick={async () => {
                            await deleteSchedule(selectedEvent.id);
                            onClose();
                          }}
                          loading={deleteSchedulePending}
                        >
                          Yes, Delete
                        </CsButton>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <CsButton onClick={onClose} disabled={deleteSchedulePending}>
                Cancel
              </CsButton>
              <CsButton
                type="submit"
                form="form-event"
                className="bg-primary text-white shadow-lg hover:shadow-xl transition-all"
                loading={createSchedulePending || updateSchedulePending}
                disabled={deleteSchedulePending}
              >
                {selectedEvent ? "Update Schedule" : "Save Schedule"}
              </CsButton>
            </div>
          </div>
        }
      >
        <div className="flex justify-center mb-6">
          <Tabs
            items={ScheduleService.TABS}
            current={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {isLoadingDetail && selectedEvent ? (
          <div className="flex h-60 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form
            className="flex flex-col gap-5 p-1 min-h-[300px]"
            onSubmit={handleSubmit(onSubmit, onError)}
            id="form-event"
          >
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
                    preIcon={
                      <Icon.Briefcase className="w-5 h-5 text-gray-400" />
                    }
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
                          icon={
                            <Icon.CalendarSchedule className="mr-2 h-4 w-4" />
                          }
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

                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">
                    Event Color
                  </label>
                  <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-2 flex-wrap items-center">
                        {ScheduleService.EVENT_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => field.onChange(c)}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 transition-all",
                              field.value === c
                                ? "border-gray-900 scale-110"
                                : "border-transparent hover:scale-105",
                            )}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <InputColor
                          color={field.value || "#000000"}
                          setColor={(c) => field.onChange(c)}
                          className="w-9 h-9 rounded-full border-2 border-transparent hover:scale-105 p-0 overflow-hidden"
                          background={
                            field.value &&
                            ScheduleService.EVENT_COLORS.includes(field.value)
                              ? "conic-gradient(from 180deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #a855f7, #ec4899, #ef4444)"
                              : undefined
                          }
                        />
                      </div>
                    )}
                  />
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
                      value={field.value || ""}
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
                      value={field.value || ""}
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
                      options={ScheduleService.SCHEDULE_TYPE_OPTIONS}
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
                      options={ScheduleService.SCHEDULE_STATUS_OPTIONS}
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
                        preIcon={
                          <Icon.User className="w-5 h-5 text-gray-400" />
                        }
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
                        preIcon={
                          <Icon.Phone className="w-5 h-5 text-gray-400" />
                        }
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
        )}
      </CsDialog>
    );
  },
);

export default EventModal;
