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
import { enUS, vi } from "date-fns/locale";
import { memo, useEffect } from "react";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { useLocale } from "next-intl";
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
  const locale = useLocale();
  const isVi = locale.toLowerCase().startsWith("vi");
  const dateLocale = isVi ? vi : enUS;
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

  const copy = {
    tabs: {
      general: isVi ? "Thông tin chung" : "General Info",
      customer: isVi ? "Khách hàng" : "Customer",
      notes: isVi ? "Ghi chú" : "Notes",
      property: isVi ? "Bất động sản liên kết" : "Linked Property",
    },
    title: isVi ? "Tiêu đề lịch hẹn" : "Schedule Title",
    date: isVi ? "Ngày" : "Date",
    color: isVi ? "Màu sự kiện" : "Event Color",
    startTime: isVi ? "Thời gian bắt đầu" : "Start Time",
    endTime: isVi ? "Thời gian kết thúc" : "End Time",
    type: isVi ? "Loại" : "Type",
    status: isVi ? "Trạng thái" : "Status",
    location: isVi ? "Địa điểm" : "Location",
    customerName: isVi ? "Tên khách hàng" : "Customer Name",
    customerPhone: isVi ? "Số điện thoại" : "Phone Number",
    customerEmail: isVi ? "Địa chỉ email" : "Email Address",
    customerNote: isVi ? "Ghi chú khách hàng" : "Customer Note",
    agentNote: isVi ? "Ghi chú nội bộ" : "Internal Agent Note",
    placeholders: {
      title: isVi ? "ví dụ: Xem căn hộ A" : "e.g. Viewing Apartment A",
      date: isVi ? "Chọn ngày" : "Pick a date",
      type: isVi ? "Chọn loại" : "Select type",
      status: isVi ? "Chọn trạng thái" : "Select status",
      location: isVi
        ? "ví dụ: 123 Nguyễn Huệ, Quận 1"
        : "e.g. 123 Main St, Springfield",
      customerName: isVi ? "Nguyễn Văn A" : "John Doe",
      customerPhone: "0987654321",
      customerEmail: isVi ? "nguyenvana@example.com" : "john@example.com",
      customerNote: isVi ? "Yêu cầu đặc biệt..." : "Special requests...",
      agentNote: isVi ? "Ghi chú riêng..." : "Private notes...",
    },
    validation: {
      title: isVi ? "Tiêu đề là bắt buộc" : "Title is required",
      startTime: isVi
        ? "Thời gian bắt đầu là bắt buộc"
        : "Start time is required",
      endTime: isVi
        ? "Thời gian kết thúc là bắt buộc"
        : "End time is required",
      type: isVi ? "Loại là bắt buộc" : "Type is required",
      status: isVi ? "Trạng thái là bắt buộc" : "Status is required",
      location: isVi ? "Địa điểm là bắt buộc" : "Location is required",
      customerName: isVi ? "Tên là bắt buộc" : "Name is required",
      customerPhone: isVi
        ? "Số điện thoại là bắt buộc"
        : "Phone is required",
      customerEmail: isVi ? "Email là bắt buộc" : "Email is required",
      customerEmailInvalid: isVi
        ? "Email không hợp lệ"
        : "Invalid email address",
    },
    statuses: {
      viewing: isVi ? "Xem nhà" : "Viewing",
      meeting: isVi ? "Họp" : "Meeting",
      call: isVi ? "Gọi" : "Call",
      pending: isVi ? "Chờ duyệt" : "Pending",
      confirmed: isVi ? "Đã xác nhận" : "Confirmed",
      cancelled: isVi ? "Đã hủy" : "Cancelled",
      completed: isVi ? "Hoàn thành" : "Completed",
      expired: isVi ? "Quá hạn" : "Expired",
    },
    noProperty: isVi
      ? "Không có ngôi nhà nào được đính kèm lịch hẹn này."
      : "No property is linked to this appointment.",
    propertyAlt: isVi ? "Bất động sản" : "Property",
    fallbackPrice: isVi ? "Thỏa thuận" : "Contact for pricing",
    addTitle: isVi ? "Thêm lịch hẹn mới" : "Add New Schedule",
    editTitle: isVi ? "Chỉnh sửa lịch hẹn" : "Edit Schedule",
    delete: isVi ? "Xóa" : "Delete",
    deleteTitle: isVi ? "Xóa lịch hẹn?" : "Delete schedule?",
    deleteDescription: isVi
      ? "Hành động này không thể hoàn tác. Bạn có chắc muốn xóa lịch hẹn này không?"
      : "This action cannot be undone. Are you sure you want to delete this schedule?",
    deleteConfirm: isVi ? "Xác nhận xóa" : "Yes, Delete",
    cancel: isVi ? "Hủy" : "Cancel",
    save: isVi ? "Lưu lịch hẹn" : "Save Schedule",
    update: isVi ? "Cập nhật lịch hẹn" : "Update Schedule",
    currency: isVi ? "VNĐ" : "VND",
  };
  const scheduleTypeOptions = [
    { label: copy.statuses.viewing, value: SCHEDULE_TYPE.VIEWING },
    { label: copy.statuses.meeting, value: SCHEDULE_TYPE.MEETING },
    { label: copy.statuses.call, value: SCHEDULE_TYPE.CALL },
  ];
  const scheduleStatusOptions = [
    { label: copy.statuses.pending, value: SCHEDULE_STATUS.PENDING },
    { label: copy.statuses.confirmed, value: SCHEDULE_STATUS.CONFIRMED },
    { label: copy.statuses.cancelled, value: SCHEDULE_STATUS.CANCELLED },
    { label: copy.statuses.completed, value: SCHEDULE_STATUS.COMPLETED },
    { label: copy.statuses.expired, value: SCHEDULE_STATUS.EXPIRED },
  ];

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
      label: copy.tabs.general,
      value: "general",
      content: (
        <div className="space-y-4 p-4">
          <Controller
            name="title"
            control={control}
            rules={{ required: copy.validation.title }}
            render={({ field }) => (
              <Input
                label={copy.title}
                placeholder={copy.placeholders.title}
                error={errors.title?.message}
                preIcon={<Icon.Briefcase className="w-5 h-5 text-gray-400" />}
                {...field}
              />
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1.5 block">
                {copy.date}
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
                          format(new Date(scheduleDetail.data.date), "LLL dd, y", {
                            locale: dateLocale,
                          })
                      ) : (
                        <span>{copy.placeholders.date}</span>
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
                {copy.color}
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
              rules={{ required: copy.validation.startTime }}
              render={({ field }) => (
                <Input
                  label={copy.startTime}
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
              rules={{ required: copy.validation.endTime }}
              render={({ field }) => (
                <Input
                  label={copy.endTime}
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
              rules={{ required: copy.validation.type }}
              render={({ field }) => {
                return (
                  <CsSelect
                    label={copy.type}
                    placeholder={copy.placeholders.type}
                    options={scheduleTypeOptions}
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
              rules={{ required: copy.validation.status }}
              render={({ field }) => {
                return (
                  <CsSelect
                    label={copy.status}
                    placeholder={copy.placeholders.status}
                    options={scheduleStatusOptions}
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
            rules={{ required: copy.validation.location }}
            render={({ field }) => (
              <Input
                label={copy.location}
                placeholder={copy.placeholders.location}
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
      label: copy.tabs.customer,
      value: "customer",
      content: (
        <div className="space-y-4 p-4">
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Controller
                name="customerName"
                control={control}
                rules={{ required: copy.validation.customerName }}
                render={({ field }) => (
                  <Input
                    label={copy.customerName}
                    placeholder={copy.placeholders.customerName}
                    error={errors.customerName?.message}
                    preIcon={<Icon.User className="w-5 h-5 text-gray-400" />}
                    {...field}
                  />
                )}
              />
              <Controller
                name="customerPhone"
                control={control}
                rules={{ required: copy.validation.customerPhone }}
                render={({ field }) => (
                  <Input
                    label={copy.customerPhone}
                    placeholder={copy.placeholders.customerPhone}
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
                required: copy.validation.customerEmail,
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: copy.validation.customerEmailInvalid,
                },
              }}
              render={({ field }) => (
                <Input
                  label={copy.customerEmail}
                  placeholder={copy.placeholders.customerEmail}
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
      label: copy.tabs.notes,
      value: "notes",
      content: (
        <div className="space-y-4 p-4">
          <Controller
            name="customerNote"
            control={control}
            render={({ field }) => (
              <CsTextarea
                label={copy.customerNote}
                placeholder={copy.placeholders.customerNote}
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
                label={copy.agentNote}
                placeholder={copy.placeholders.agentNote}
                error={errors.agentNote?.message}
                {...field}
              />
            )}
          />
        </div>
      ),
    },
    {
      label: copy.tabs.property,
      value: "property",
      content: (
        <div className="space-y-4 p-4">
          {scheduleDetail?.data?.listingId &&
          typeof scheduleDetail.data.listingId === "object" ? (
            <div
              className="flex gap-4 p-4 border rounded-xl hover:shadow-md transition-shadow cursor-pointer border-gray-100 bg-gray-50/50"
              onClick={() =>
                window.open(
                  `/properties/${(scheduleDetail.data.listingId as any)._id || (scheduleDetail.data.listingId as any).id}`,
                  "_blank",
                )
              }
            >
              <img
                src={
                  (scheduleDetail.data.listingId as any).media?.thumbnail ||
                  (scheduleDetail.data.listingId as any).media?.images?.[0] ||
                  "https://via.placeholder.com/150"
                }
                alt={copy.propertyAlt}
                className="w-28 h-28 shrink-0 rounded-lg object-cover border border-gray-200"
              />
              <div className="flex flex-col flex-1 justify-center gap-1.5 overflow-hidden">
                <h4 className="font-bold text-gray-800 line-clamp-2 leading-tight">
                  {(scheduleDetail.data.listingId as any).title}
                </h4>
                <p className="text-base font-extrabold text-red-600">
                  {(
                    scheduleDetail.data.listingId as any
                  ).features?.price?.toLocaleString() || copy.fallbackPrice}
                  <span className="text-xs text-gray-500 font-medium ml-1">
                    {copy.currency}
                  </span>
                </p>
                {(scheduleDetail.data.listingId as any).location?.address && (
                  <div className="flex items-start gap-1 text-sm text-gray-500">
                    <Icon.MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="line-clamp-2">
                      {(scheduleDetail.data.listingId as any).location.address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Icon.ArrowRight className="w-12 h-12 text-gray-200 mb-3" />
                <p className="text-gray-400 font-medium">{copy.noProperty}</p>
              </div>
            )}
        </div>
      ),
    },
  ];

  return (
    <CsDialog
      open={open}
      onOpenChange={onClose}
      title={id ? copy.editTitle : copy.addTitle}
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
                      {copy.delete}
                    </CsButton>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="flex flex-col gap-2">
                    <div className="space-y-1">
                      <h4 className="font-medium leading-none">
                        {copy.deleteTitle}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {copy.deleteDescription}
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
                        {copy.deleteConfirm}
                      </CsButton>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <div className="flex gap-2">
            <CsButton onClick={onClose} type="button" variant="outline">
              {copy.cancel}
            </CsButton>
            <CsButton
              type="submit"
              form="form-event"
              className="bg-primary text-white shadow-lg hover:shadow-xl transition-all"
              loading={createSchedulePending || updateSchedulePending}
            >
              {id ? copy.update : copy.save}
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
