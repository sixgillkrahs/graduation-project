import { CsButton } from "@/components/custom";
import { CsDialog } from "@/components/custom/dialog";
import CsTabs from "@/components/custom/tabs";
import { Icon } from "@/components/ui";
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
import { memo, useEffect } from "react";
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
import { useGetScheduleById } from "../services/query";
import ScheduleService from "../services/service";

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  id: string;
}

const EventDialog = memo(({ open, onClose, id }: EventDialogProps) => {
  const { mutateAsync: createSchedule, isPending: createSchedulePending } =
    useCreateSchedule();
  const { mutateAsync: updateSchedule, isPending: updateSchedulePending } =
    useUpdateSchedule();
  const { mutateAsync: deleteSchedule, isPending: deleteSchedulePending } =
    useDeleteSchedule();
  const { data: scheduleDetail, isLoading: isLoadingDetail } =
    useGetScheduleById(id);

  const {
    control,
    handleSubmit,
    setValue,
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
    },
  });

  useEffect(() => {
    if (open && scheduleDetail?.data) {
      console.log("Resetting form with:", scheduleDetail.data);
      const statusToSet = scheduleDetail.data.status || SCHEDULE_STATUS.PENDING;
      setValue("title", scheduleDetail.data.title || "");
      setValue(
        "color",
        scheduleDetail.data.color || ScheduleService.EVENT_COLORS[0],
      );
      setValue(
        "date",
        scheduleDetail.data.date
          ? new Date(scheduleDetail.data.date)
          : new Date(),
      );
      setValue("startTime", scheduleDetail.data.startTime || "09:00");
      setValue("endTime", scheduleDetail.data.endTime || "10:00");
      setValue("location", scheduleDetail.data.location || "");
      setValue("type", scheduleDetail.data.type || SCHEDULE_TYPE.VIEWING);
      setValue("status", statusToSet);
      setValue("customerNote", scheduleDetail.data.customerNote || "");
      setValue("agentNote", scheduleDetail.data.agentNote || "");
      setValue("customerName", scheduleDetail.data.customerName || "");
      setValue("customerPhone", scheduleDetail.data.customerPhone || "");
      setValue("customerEmail", scheduleDetail.data.customerEmail || "");
    }
  }, [open, scheduleDetail?.data, setValue]);

  const onTimeChange = (type: "start" | "end", timeStr: string) => {
    if (!timeStr) return;
    if (type === "start") {
      setValue("startTime", timeStr);
    } else {
      setValue("endTime", timeStr);
    }
  };

  const onSubmit = async (data: CreateScheduleRequest) => {
    if (id) {
      await updateSchedule({ id: id, data });
    } else {
      // Logic for new schedule if id is empty, though current props imply id always exists or handling creation differently
      // But preserving mostly EventModal logic
      await createSchedule(data);
    }
    onClose();
  };

  const onError = (errors: FieldErrors<CreateScheduleRequest>) => {
    // Tab switching logic is handled by user manually in CsTabs usually,
    // but here we might need to alert or just let the user find the error.
    // Since CsTabs doesn't expose external control prop easily in its current interface (it uses internal Radix state or defaultValue),
    // we might skip auto-tab-switch or implement a controlled version if needed.
    // For now, we'll rely on form validation messages.
    console.error(errors);
  };

  const TABS = [
    {
      label: "General Info",
      value: "general",
      content: (
        <div className="space-y-4 p-4">
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
                        !scheduleDetail?.data?.date && "text-muted-foreground",
                      )}
                      icon={<Icon.CalendarSchedule className="mr-2 h-4 w-4" />}
                    >
                      {scheduleDetail?.data?.date ? (
                        format(new Date(scheduleDetail.data.date), "LLL dd, y")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </CsButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="single"
                      defaultMonth={
                        scheduleDetail?.data?.date
                          ? new Date(scheduleDetail.data.date)
                          : new Date()
                      }
                      selected={
                        scheduleDetail?.data?.date
                          ? new Date(scheduleDetail.data.date)
                          : undefined
                      }
                      onSelect={(date) => date && setValue("date", date)}
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
              render={({ field }) => {
                return (
                  <CsSelect
                    label="Type"
                    placeholder="Select type"
                    options={ScheduleService.SCHEDULE_TYPE_OPTIONS}
                    error={errors.type?.message}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                );
              }}
            />

            <Controller
              name="status"
              control={control}
              rules={{ required: "Status is required" }}
              render={({ field }) => {
                return (
                  <CsSelect
                    label="Status"
                    placeholder="Select status"
                    options={ScheduleService.SCHEDULE_STATUS_OPTIONS}
                    error={errors.status?.message}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                );
              }}
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
      ),
    },
    {
      label: "Customer",
      value: "customer",
      content: (
        <div className="space-y-4 p-4">
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
      ),
    },
    {
      label: "Notes",
      value: "notes",
      content: (
        <div className="space-y-4 p-4">
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
      ),
    },
  ];

  return (
    <CsDialog
      open={open}
      onOpenChange={onClose}
      title={id ? "Edit Schedule" : "Add New Schedule"}
      width={600}
      footer={
        <>
          <div>
            {id && (
              <Popover>
                <PopoverTrigger asChild>
                  <div className="inline-block">
                    <CsButton
                      type="button"
                      variant="destructive"
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
                          await deleteSchedule(id);
                          onClose();
                        }}
                        loading={deleteSchedulePending}
                        type="button"
                      >
                        Yes, Delete
                      </CsButton>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <div className="flex gap-2">
            <CsButton onClick={onClose} type="button" variant="outline">
              Cancel
            </CsButton>
            <CsButton
              type="submit"
              form="form-event"
              className="bg-primary text-white shadow-lg hover:shadow-xl transition-all"
              loading={createSchedulePending || updateSchedulePending}
            >
              {id ? "Update Schedule" : "Save Schedule"}
            </CsButton>
          </div>
        </>
      }
    >
      <div className="">
        {isLoadingDetail ? (
          <div className="flex h-60 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form id="form-event" onSubmit={handleSubmit(onSubmit, onError)}>
            <CsTabs item={TABS} defaultValue="general" />
          </form>
        )}
      </div>
    </CsDialog>
  );
});

EventDialog.displayName = "EventDialog";

export default EventDialog;
