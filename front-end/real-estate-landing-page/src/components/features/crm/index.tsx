"use client";

import {
  Calendar,
  CheckCircle2,
  Download,
  History,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  UserRoundPlus,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "@/lib/toast";
import CsTabs from "@/components/custom/tabs";
import { useUpdateLeadStatus } from "@/components/features/leads/services/mutate";
import { useGetAgentLeads } from "@/components/features/leads/services/query";
import {
  type ILeadDto,
  LeadStatus,
} from "@/components/features/leads/services/type";
import {
  type IScheduleDTO,
  SCHEDULE_STATUS,
} from "@/components/features/schedule/dto/schedule.dto";
import { useUpdateSchedule } from "@/components/features/schedule/services/mutation";
import { useGetLeads } from "@/components/features/schedule/services/query";
import { Input } from "@/components/ui/input";
import { CsTable, type TableColumn } from "@/components/ui/table";
import { useDateTimeFormatter } from "@/hooks/useDateTimeFormatter";

const getLeadStatusMeta = (
  isVi: boolean,
): Record<LeadStatus, { label: string; className: string }> => ({
  NEW: {
    label: isVi ? "Mới" : "New",
    className: "bg-amber-100 text-amber-700",
  },
  CONTACTED: {
    label: isVi ? "Đã liên hệ" : "Contacted",
    className: "bg-blue-100 text-blue-700",
  },
  QUALIFIED: {
    label: isVi ? "Đủ điều kiện" : "Qualified",
    className: "bg-violet-100 text-violet-700",
  },
  SCHEDULED: {
    label: isVi ? "Đã lên lịch" : "Scheduled",
    className: "bg-emerald-100 text-emerald-700",
  },
  WON: {
    label: isVi ? "Thành công" : "Won",
    className: "bg-green-100 text-green-700",
  },
  LOST: {
    label: isVi ? "Thất bại" : "Lost",
    className: "bg-rose-100 text-rose-700",
  },
});

const getTopicLabels = (isVi: boolean): Record<string, string> => ({
  PRICE: isVi ? "Giá" : "Price",
  LEGAL: isVi ? "Pháp lý" : "Legal",
  LOCATION: isVi ? "Vị trí" : "Location",
  NEGOTIATION: isVi ? "Đàm phán" : "Negotiation",
  VIEWING: isVi ? "Xem nhà" : "Viewing",
  FURNITURE: isVi ? "Nội thất" : "Furniture",
  PAYMENT: isVi ? "Thanh toán" : "Payment",
});

const getIntentLabels = (isVi: boolean): Record<string, string> => ({
  BUY_TO_LIVE: isVi ? "Mua để ở" : "Buy to live",
  INVEST: isVi ? "Đầu tư" : "Investment",
  RENT: isVi ? "Thuê" : "Rent",
  CONSULTATION: isVi ? "Tư vấn" : "Consultation",
});

const getContactTimeLabels = (isVi: boolean): Record<string, string> => ({
  ASAP: isVi ? "Càng sớm càng tốt" : "ASAP",
  TODAY: isVi ? "Hôm nay" : "Today",
  NEXT_24_HOURS: isVi ? "Trong 24 giờ" : "Within 24h",
  THIS_WEEKEND: isVi ? "Cuối tuần này" : "This weekend",
});

const getContactChannelLabels = (isVi: boolean): Record<string, string> => ({
  PHONE: isVi ? "Điện thoại" : "Phone",
  CHAT: "Chat",
  ZALO: "Zalo",
  EMAIL: "Email",
});

const getLeadSourceMeta = (
  isVi: boolean,
): Record<string, { label: string; className: string }> => ({
  PROPERTY_CALL: {
    label: isVi ? "Gọi" : "Call",
    className: "bg-emerald-50 text-emerald-700",
  },
  PROPERTY_CHAT: {
    label: "Chat",
    className: "bg-blue-50 text-blue-700",
  },
  PROPERTY_REQUEST: {
    label: isVi ? "Yêu cầu" : "Request",
    className: "bg-amber-50 text-amber-700",
  },
});

const getScheduleStatusMeta = (
  isVi: boolean,
): Record<
  SCHEDULE_STATUS,
  { label: string; className: string }
> => ({
  PENDING: {
    label: isVi ? "Chờ duyệt" : "Pending approval",
    className: "bg-amber-50 text-amber-700",
  },
  CONFIRMED: {
    label: isVi ? "Đã xác nhận" : "Confirmed",
    className: "bg-blue-50 text-blue-700",
  },
  CANCELLED: {
    label: isVi ? "Đã hủy" : "Cancelled",
    className: "bg-rose-50 text-rose-700",
  },
  COMPLETED: {
    label: isVi ? "Hoàn thành" : "Completed",
    className: "bg-emerald-50 text-emerald-700",
  },
  EXPIRED: {
    label: isVi ? "Quá hạn" : "Expired",
    className: "bg-gray-100 text-gray-700",
  },
});

type CRMHistoryEvent = {
  id: string;
  label: string;
  detail: string;
  occurredAt: string;
  timestamp: number;
  className: string;
  statusLabel?: string;
  statusClassName?: string;
  note?: string;
};

type CRMContactHistoryRow = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  listing: CRMListing;
  historyItems: CRMHistoryEvent[];
  latestActivityAt: string;
  latestActivityTimestamp: number;
};

type CRMListing = ILeadDto["listingId"] | IScheduleDTO["listingId"];
type CRMListingValue = CRMListing | null | undefined;

const normalizePhone = (value?: string) => (value || "").replace(/[^\d+]/g, "");

const getListingId = (listing: CRMListingValue) => {
  if (!listing || typeof listing === "string") {
    return listing || "";
  }

  return listing._id || listing.id || "";
};

const getListingTitle = (listing: CRMListingValue) => {
  if (!listing || typeof listing === "string") {
    return "";
  }

  return listing.title || "";
};

const getListingAddress = (listing: CRMListingValue) => {
  if (!listing || typeof listing === "string") {
    return "";
  }

  return listing.location?.address || "";
};

const getListingImage = (listing: CRMListing) => {
  if (!listing || typeof listing === "string") {
    return "https://placehold.co/96x96/png";
  }

  return (
    listing.media?.thumbnail ||
    listing.media?.images?.[0] ||
    "https://placehold.co/96x96/png"
  );
};

export const CRMFeature = () => {
  const locale = useLocale();
  const isVi = locale.toLowerCase().startsWith("vi");
  const { formatDateTime: formatDateTimeByLocale, formatDate } =
    useDateTimeFormatter();
  const { data: scheduleLeadsResponse, isLoading: isLoadingSchedules } =
    useGetLeads();
  const { data: inquiryLeadsResponse, isLoading: isLoadingInquiryLeads } =
    useGetAgentLeads();
  const { mutateAsync: updateSchedule, isPending: isUpdatingSchedule } =
    useUpdateSchedule();
  const { mutateAsync: updateLeadStatus, isPending: isUpdatingLeadStatus } =
    useUpdateLeadStatus();

  const scheduleContacts = scheduleLeadsResponse?.data || [];
  const inquiryLeads = inquiryLeadsResponse?.data || [];

  const [searchTerm, setSearchTerm] = useState("");
  const copy = {
    header: {
      title: isVi ? "Khách hàng & CRM" : "Leads & CRM",
      description: isVi
        ? "Thu thập lead từ trang chi tiết tin đăng, theo dõi nhanh và chuyển đổi khách hàng tiềm năng thành lịch hẹn."
        : "Capture fresh inquiries from listing pages, follow up quickly, and turn qualified prospects into appointments.",
      export: isVi ? "Xuất CSV" : "Export CSV",
    },
    stats: {
      total: isVi ? "Tổng lead" : "Total Leads",
      inquiries: isVi ? "Lead mới" : "New Inquiries",
      completed: isVi ? "Buổi xem đã hoàn thành" : "Completed Viewings",
      upcoming: isVi ? "Lịch hẹn sắp tới" : "Upcoming Appointments",
    },
    searchTitle: isVi
      ? "Tìm trên toàn bộ inquiry và lịch hẹn"
      : "Search across inquiries and appointments",
    searchPlaceholder: isVi
      ? "Tìm khách hàng, email hoặc bất động sản..."
      : "Search customers, emails or properties...",
    sectionTitle: isVi ? "Mục CRM" : "CRM Sections",
    sectionDescription: isVi
      ? "Chuyển tab để xem lịch sử liên hệ, inquiry mới và lead từ lịch hẹn mà không làm trang quá dài."
      : "Switch between tabs to review contact history, new inquiries, and appointment leads without stretching the page.",
    tabs: {
      history: isVi ? "Lịch sử liên hệ" : "Contact history",
      inquiries: isVi ? "Inquiry mới" : "New inquiries",
      appointments: isVi ? "Lịch hẹn" : "Appointments",
    },
    panels: {
      historyTitle: isVi
        ? "Lịch sử liên hệ theo khách mua và tin đăng"
        : "Contact history by buyer and listing",
      historyDescription: isVi
        ? "Dòng thời gian hợp nhất cho biết khách nào đã gọi, chat, gửi yêu cầu hoặc đặt lịch xem từ từng tin đăng."
        : "Unified timeline showing which buyer called, chatted, sent a request, or booked a viewing from each listing.",
      historyEmpty: isVi
        ? "Chưa có lịch sử liên hệ. Cuộc gọi, chat, yêu cầu và đặt lịch xem sẽ xuất hiện tại đây."
        : "No contact history yet. Calls, chats, requests, and viewing bookings will appear here.",
      inquiriesTitle: isVi ? "Inquiry mới" : "New inquiries",
      inquiriesDescription: isVi
        ? "Lead được ghi nhận từ các hành động Gọi, Chat và Gửi yêu cầu trên trang chi tiết bất động sản."
        : "Leads tracked from the property detail Call, Chat, and Send request actions.",
      inquiriesEmpty: isVi
        ? "Chưa có inquiry nào. Các biểu mẫu yêu cầu mới sẽ xuất hiện tại đây."
        : "No inquiries yet. New request-info submissions will appear here.",
      appointmentsTitle: isVi
        ? "Lead đủ điều kiện từ lịch hẹn"
        : "Qualified leads from appointments",
      appointmentsDescription: isVi
        ? "Các yêu cầu xem nhà đã xác nhận hoặc hoàn thành và đã đi sâu hơn trong phễu chuyển đổi."
        : "Confirmed or completed viewing requests that have already moved deeper into the funnel.",
      appointmentsEmpty: isVi
        ? "Chưa có lead từ lịch hẹn. Các yêu cầu xem nhà đã xác nhận sẽ xuất hiện tại đây."
        : "No appointment leads yet. Confirmed viewing requests will appear here.",
    },
    columns: {
      buyer: isVi ? "Khách mua" : "Buyer",
      listing: isVi ? "Tin đăng" : "Listing",
      contactHistory: isVi ? "Lịch sử liên hệ" : "Contact history",
      lastTouch: isVi ? "Tương tác gần nhất" : "Last touch",
      actions: isVi ? "Thao tác" : "Actions",
      customer: isVi ? "Khách hàng" : "Customer",
      property: isVi ? "Bất động sản" : "Property",
      source: isVi ? "Nguồn" : "Source",
      inquiry: isVi ? "Nhu cầu" : "Inquiry",
      followUp: isVi ? "Theo dõi" : "Follow-up",
      status: isVi ? "Trạng thái" : "Status",
      customerInfo: isVi ? "Thông tin khách hàng" : "Customer Info",
      propertyOfInterest: isVi
        ? "Bất động sản quan tâm"
        : "Property of Interest",
      appointmentDetails: isVi ? "Chi tiết lịch hẹn" : "Appointment Details",
      notes: isVi ? "Ghi chú" : "Notes",
    },
    labels: {
      unknownBuyer: isVi ? "Khách mua chưa rõ" : "Unknown buyer",
      noPhone: isVi ? "Chưa có số điện thoại" : "No phone",
      propertyListing: isVi ? "Tin bất động sản" : "Property listing",
      addressHidden: isVi ? "Địa chỉ đang ẩn" : "Address hidden",
      noPropertyLinked: isVi
        ? "Chưa liên kết bất động sản"
        : "No property linked",
      trackedFromProperty: isVi
        ? "Ghi nhận từ trang chi tiết tin đăng"
        : "Tracked from property detail",
      budget: isVi ? "Ngân sách" : "Budget",
      resubmitted: isVi ? "Gửi lại" : "Re-submitted",
      times: isVi ? "lần" : "times",
      earlierActions: isVi
        ? "hoạt động liên hệ trước đó"
        : "earlier contact actions",
      trackedTouchpoint: isVi
        ? "điểm chạm đã ghi nhận"
        : "tracked touchpoint",
      trackedTouchpoints: isVi
        ? "điểm chạm đã ghi nhận"
        : "tracked touchpoints",
      bookedViewing: isVi ? "Đặt lịch xem" : "Booked viewing",
      noNotes: isVi ? "Không có ghi chú" : "No notes",
      customerShort: isVi ? "Khách" : "Cust",
      youShort: isVi ? "Bạn" : "You",
    },
    actions: {
      call: isVi ? "Gọi khách hàng" : "Call customer",
      zalo: isVi ? "Nhắn qua Zalo" : "Message via Zalo",
      email: isVi ? "Gửi email" : "Send email",
      complete: isVi ? "Đánh dấu hoàn thành" : "Mark as completed",
    },
    toasts: {
      leadUpdated: isVi
        ? "Cập nhật trạng thái lead thành công."
        : "Lead status updated.",
      leadError: isVi
        ? "Không thể cập nhật trạng thái lead."
        : "Could not update lead status.",
      appointmentCompleted: isVi
        ? "Đã đánh dấu lịch hẹn là hoàn thành."
        : "Appointment marked as completed.",
      appointmentError: isVi
        ? "Không thể cập nhật trạng thái lịch hẹn."
        : "Could not update appointment status.",
    },
  };
  const leadStatusMeta = getLeadStatusMeta(isVi);
  const topicLabels = getTopicLabels(isVi);
  const intentLabels = getIntentLabels(isVi);
  const contactTimeLabels = getContactTimeLabels(isVi);
  const contactChannelLabels = getContactChannelLabels(isVi);
  const leadSourceMeta = getLeadSourceMeta(isVi);
  const scheduleStatusMeta = getScheduleStatusMeta(isVi);

  const filteredInquiryLeads = useMemo(() => {
    if (!searchTerm) {
      return inquiryLeads;
    }

    const keyword = searchTerm.toLowerCase();

    return inquiryLeads.filter(
      (lead) =>
        lead.customerName?.toLowerCase().includes(keyword) ||
        lead.customerEmail?.toLowerCase().includes(keyword) ||
        lead.customerPhone?.includes(searchTerm) ||
        lead.listingId?.title?.toLowerCase().includes(keyword),
    );
  }, [inquiryLeads, searchTerm]);

  const appointmentLeads = useMemo(
    () =>
      scheduleContacts.filter((lead: IScheduleDTO) =>
        [SCHEDULE_STATUS.CONFIRMED, SCHEDULE_STATUS.COMPLETED].includes(
          lead.status,
        ),
      ),
    [scheduleContacts],
  );

  const filteredLeads = useMemo(() => {
    if (!searchTerm) {
      return appointmentLeads;
    }

    const keyword = searchTerm.toLowerCase();

    return appointmentLeads.filter(
      (lead: IScheduleDTO) =>
        lead.customerName?.toLowerCase().includes(keyword) ||
        lead.customerEmail?.toLowerCase().includes(keyword) ||
        lead.customerPhone?.includes(searchTerm) ||
        getListingTitle(lead.listingId)?.toLowerCase().includes(keyword),
    );
  }, [appointmentLeads, searchTerm]);

  const contactHistoryRows = useMemo(() => {
    const grouped = new Map<string, CRMContactHistoryRow>();

    const upsertRow = ({
      customerName,
      customerPhone,
      customerEmail,
      listing,
    }: {
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      listing?: CRMListing;
    }) => {
      const listingId = getListingId(listing);
      const normalizedPhone = normalizePhone(customerPhone);
      const normalizedEmail = (customerEmail || "").trim().toLowerCase();
      const key = `${listingId}::${normalizedPhone || normalizedEmail || customerName}`;

      let current = grouped.get(key);

      if (!current) {
        current = {
          id: key,
          customerName: customerName || copy.labels.unknownBuyer,
          customerPhone: customerPhone || "",
          customerEmail: customerEmail || "",
          listing: listing || null,
          historyItems: [],
          latestActivityAt: "",
          latestActivityTimestamp: 0,
        };
        grouped.set(key, current);
      }
      if (
        !current.customerName ||
        current.customerName === copy.labels.unknownBuyer
      ) {
        current.customerName = customerName || copy.labels.unknownBuyer;
      }
      if (!current.customerPhone) {
        current.customerPhone = customerPhone || "";
      }
      if (!current.customerEmail) {
        current.customerEmail = customerEmail || "";
      }
      if (!current.listing) {
        current.listing = listing || null;
      }

      return current;
    };

    inquiryLeads.forEach((lead) => {
      const row = upsertRow({
        customerName: lead.customerName,
        customerPhone: lead.customerPhone,
        customerEmail: lead.customerEmail,
        listing: lead.listingId,
      });
      const sourceMeta = leadSourceMeta[lead.source] || {
        label: lead.source,
        className: "bg-gray-100 text-gray-700",
      };
      const timestampSource =
        lead.lastSubmittedAt || lead.updatedAt || lead.createdAt;
      const eventTimestamp = new Date(timestampSource).getTime();

      row.historyItems.push({
        id: `${lead._id}-${lead.source}`,
        label: sourceMeta.label,
        detail: formatDateTimeByLocale(timestampSource),
        occurredAt: timestampSource,
        timestamp: Number.isNaN(eventTimestamp) ? 0 : eventTimestamp,
        className: sourceMeta.className,
        statusLabel: leadStatusMeta[lead.status]?.label,
        statusClassName: leadStatusMeta[lead.status]?.className,
        note:
          lead.message ||
          (lead.submissionCount > 1
            ? `${copy.labels.resubmitted} ${lead.submissionCount} ${copy.labels.times}`
            : undefined),
      });
    });

    scheduleContacts.forEach((schedule: IScheduleDTO) => {
      const row = upsertRow({
        customerName: schedule.customerName,
        customerPhone: schedule.customerPhone,
        customerEmail: schedule.customerEmail,
        listing: schedule.listingId,
      });
      const eventTimestamp = new Date(
        schedule.createdAt || schedule.date,
      ).getTime();
      const statusMeta = scheduleStatusMeta[schedule.status];

      row.historyItems.push({
        id: `${schedule._id || schedule.id}-booking`,
        label: copy.labels.bookedViewing,
        detail: `${formatDateTimeByLocale(schedule.createdAt || schedule.date)} | ${formatDate(schedule.date)} | ${schedule.startTime} - ${schedule.endTime}`,
        occurredAt: String(schedule.createdAt || schedule.date),
        timestamp: Number.isNaN(eventTimestamp) ? 0 : eventTimestamp,
        className: "bg-violet-50 text-violet-700",
        statusLabel: statusMeta?.label,
        statusClassName: statusMeta?.className,
        note: schedule.customerNote || undefined,
      });
    });

    return Array.from(grouped.values())
      .map((row) => {
        const historyItems = [...row.historyItems].sort(
          (a, b) => b.timestamp - a.timestamp,
        );
        const latestItem = historyItems[0];

        return {
          ...row,
          historyItems,
          latestActivityAt: latestItem?.detail || "-",
          latestActivityTimestamp: latestItem?.timestamp || 0,
        };
      })
      .sort((a, b) => b.latestActivityTimestamp - a.latestActivityTimestamp);
  }, [inquiryLeads, scheduleContacts]);

  const filteredContactHistory = useMemo(() => {
    if (!searchTerm) {
      return contactHistoryRows;
    }

    const keyword = searchTerm.toLowerCase();

    return contactHistoryRows.filter(
      (row) =>
        row.customerName?.toLowerCase().includes(keyword) ||
        row.customerEmail?.toLowerCase().includes(keyword) ||
        row.customerPhone?.includes(searchTerm) ||
        getListingTitle(row.listing)?.toLowerCase().includes(keyword) ||
        row.historyItems.some((item) =>
          item.label.toLowerCase().includes(keyword),
        ),
    );
  }, [contactHistoryRows, searchTerm]);

  const completedCount = appointmentLeads.filter(
    (lead: IScheduleDTO) => lead.status === "COMPLETED",
  ).length;
  const confirmedCount = appointmentLeads.filter(
    (lead: IScheduleDTO) => lead.status === "CONFIRMED",
  ).length;
  const newInquiryCount = inquiryLeads.filter(
    (lead) => lead.status === LeadStatus.NEW,
  ).length;

  const contactHistoryColumns: TableColumn<CRMContactHistoryRow>[] = [
    {
      title: copy.columns.buyer,
      dataIndex: "customerName",
      key: "customerName",
      render: (_: unknown, record: CRMContactHistoryRow) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">
            {record.customerName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {record.customerName}
            </span>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <Phone className="h-3.5 w-3.5" />
              <span>{record.customerPhone || copy.labels.noPhone}</span>
            </div>
            {record.customerEmail && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-3.5 w-3.5" />
                <span>{record.customerEmail}</span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: copy.columns.listing,
      dataIndex: "listing",
      key: "listing",
      render: (_: unknown, record: CRMContactHistoryRow) =>
        record.listing ? (
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
            onClick={() => {
              const listingId = getListingId(record.listing);
              if (!listingId) {
                return;
              }

              window.open(`/agent/listings/${listingId}`, "_blank");
            }}
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200">
              <Image
                src={getListingImage(record.listing)}
                alt={getListingTitle(record.listing) || copy.labels.propertyListing}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="line-clamp-1 max-w-[220px] font-medium text-gray-900">
                {getListingTitle(record.listing) || copy.labels.propertyListing}
              </span>
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="line-clamp-1">
                  {getListingAddress(record.listing) || copy.labels.addressHidden}
                </span>
              </div>
            </div>
          </button>
        ) : (
          <span className="italic text-gray-400">{copy.labels.noPropertyLinked}</span>
        ),
    },
    {
      title: copy.columns.contactHistory,
      dataIndex: "historyItems",
      key: "historyItems",
      render: (_: unknown, record: CRMContactHistoryRow) => (
        <div className="min-w-[320px] space-y-2">
          {record.historyItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-100 bg-gray-50/70 p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${item.className}`}
                >
                  {item.label}
                </span>
                {item.statusLabel && item.statusClassName && (
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${item.statusClassName}`}
                  >
                    {item.statusLabel}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">{item.detail}</p>
              {item.note && (
                <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                  {item.note}
                </p>
              )}
            </div>
          ))}
          {record.historyItems.length > 3 && (
            <p className="text-xs text-gray-500">
              +{record.historyItems.length - 3} {copy.labels.earlierActions}
            </p>
          )}
        </div>
      ),
    },
    {
      title: copy.columns.lastTouch,
      dataIndex: "latestActivityAt",
      key: "latestActivityAt",
      render: (_: unknown, record: CRMContactHistoryRow) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-800">
            {record.latestActivityAt}
          </p>
          <p className="text-xs text-gray-500">
            {record.historyItems.length}{" "}
            {record.historyItems.length > 1
              ? copy.labels.trackedTouchpoints
              : copy.labels.trackedTouchpoint}
          </p>
        </div>
      ),
    },
    {
      title: copy.columns.actions,
      dataIndex: "id",
      key: "actions",
      align: "center",
      render: (_: unknown, record: CRMContactHistoryRow) => (
        <div className="flex items-center justify-center gap-2">
          {record.customerPhone && (
            <>
              <a
                href={`tel:${record.customerPhone}`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                title={copy.actions.call}
              >
                <Phone className="h-4 w-4" />
              </a>
              <a
                href={`https://zalo.me/${record.customerPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
                title={copy.actions.zalo}
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </>
          )}
          {record.customerEmail && (
            <a
              href={`mailto:${record.customerEmail}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
              title={copy.actions.email}
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
        </div>
      ),
    },
  ];

  const inquiryColumns: any[] = [
    {
      title: copy.columns.customer,
      dataIndex: "customer",
      key: "customer",
      render: (_: unknown, record: ILeadDto) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700">
            {record.customerName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {record.customerName}
            </span>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <Phone className="h-3.5 w-3.5" />
              <span>{record.customerPhone}</span>
            </div>
            {record.customerEmail && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-3.5 w-3.5" />
                <span>{record.customerEmail}</span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: copy.columns.property,
      dataIndex: "property",
      key: "property",
      render: (_: unknown, record: ILeadDto) =>
        record.listingId ? (
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
            onClick={() =>
              window.open(
                `/agent/listings/${record.listingId._id || record.listingId.id}`,
                "_blank",
              )
            }
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200">
              <Image
                src={getListingImage(record.listingId)}
                alt={record.listingId.title || copy.labels.propertyListing}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="line-clamp-1 max-w-[220px] font-medium text-gray-900">
                {record.listingId.title}
              </span>
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="line-clamp-1">
                  {record.listingId.location?.address}
                </span>
              </div>
            </div>
          </button>
        ) : (
          <span className="italic text-gray-400">{copy.labels.noPropertyLinked}</span>
        ),
    },
    {
      title: copy.columns.source,
      dataIndex: "source",
      key: "source",
      render: (_: unknown, record: ILeadDto) => {
        const sourceMeta = leadSourceMeta[record.source] || {
          label: record.source,
          className: "bg-gray-100 text-gray-700",
        };

        return (
          <div className="space-y-2">
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${sourceMeta.className}`}
            >
              {sourceMeta.label}
            </span>
            <p className="text-xs text-gray-500">
              {copy.labels.trackedFromProperty}
            </p>
          </div>
        );
      },
    },
    {
      title: copy.columns.inquiry,
      dataIndex: "inquiry",
      key: "inquiry",
      render: (_: unknown, record: ILeadDto) => (
        <div className="max-w-[280px] space-y-2">
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
              {intentLabels[record.intent] || record.intent}
            </span>
            {record.interestTopics.map((topic) => (
              <span
                key={`${record._id}-${topic}`}
                className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
              >
                {topicLabels[topic] || topic}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {copy.labels.budget}:{" "}
            <span className="font-medium text-gray-700">
              {record.budgetRange}
            </span>
          </p>
          {record.message && (
            <p className="line-clamp-2 text-xs text-gray-600">
              {record.message}
            </p>
          )}
        </div>
      ),
    },
    {
      title: copy.columns.followUp,
      dataIndex: "followUp",
      key: "followUp",
      render: (_: unknown, record: ILeadDto) => (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-800">
            {contactTimeLabels[record.preferredContactTime] ||
              record.preferredContactTime}
          </p>
          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
            {contactChannelLabels[record.preferredContactChannel] ||
              record.preferredContactChannel}
          </span>
          <p className="text-xs text-gray-500">
            {formatDateTimeByLocale(record.createdAt)}
          </p>
          {record.submissionCount > 1 && (
            <p className="text-xs text-amber-600">
              {copy.labels.resubmitted} {record.submissionCount}{" "}
              {copy.labels.times}
            </p>
          )}
        </div>
      ),
    },
    {
      title: copy.columns.status,
      dataIndex: "status",
      key: "status",
      render: (_: unknown, record: ILeadDto) => (
        <div className="space-y-2">
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
              leadStatusMeta[record.status].className
            }`}
          >
            {leadStatusMeta[record.status].label}
          </span>
          <select
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none"
            value={record.status}
            onChange={async (event) => {
              try {
                await updateLeadStatus({
                  id: record._id,
                  status: event.target.value as LeadStatus,
                });
                toast.success(copy.toasts.leadUpdated);
              } catch (_error) {
                toast.error(copy.toasts.leadError);
              }
            }}
            disabled={isUpdatingLeadStatus}
          >
            {Object.values(LeadStatus).map((status) => (
              <option key={status} value={status}>
                {leadStatusMeta[status].label}
              </option>
            ))}
          </select>
        </div>
      ),
    },
    {
      title: copy.columns.actions,
      dataIndex: "actions",
      key: "actions",
      align: "center",
      render: (_: unknown, record: ILeadDto) => (
        <div className="flex items-center justify-center gap-2">
          <a
            href={`tel:${record.customerPhone}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
            title={copy.actions.call}
          >
            <Phone className="h-4 w-4" />
          </a>
          <a
            href={`https://zalo.me/${record.customerPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
            title={copy.actions.zalo}
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          {record.customerEmail && (
            <a
              href={`mailto:${record.customerEmail}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
              title={copy.actions.email}
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
        </div>
      ),
    },
  ];

  const appointmentColumns: any[] = [
    {
      title: copy.columns.customerInfo,
      dataIndex: "customerInfo",
      key: "customerInfo",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
            {record.customerName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {record.customerName}
            </span>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <Phone className="h-3.5 w-3.5" />
              <span>{record.customerPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="h-3.5 w-3.5" />
              <span>{record.customerEmail}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: copy.columns.propertyOfInterest,
      dataIndex: "property",
      key: "property",
      render: (_: any, record: any) =>
        record.listingId ? (
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
            onClick={() =>
              window.open(
                `/agent/listings/${record.listingId._id || record.listingId.id}`,
                "_blank",
              )
            }
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200">
              <Image
                src={getListingImage(record.listingId)}
                alt={record.listingId.title || copy.labels.propertyListing}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="line-clamp-1 max-w-[200px] font-medium text-gray-900">
                {record.listingId.title}
              </span>
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="line-clamp-1">
                  {record.listingId.location?.address}
                </span>
              </div>
            </div>
          </button>
        ) : (
          <span className="italic text-gray-400">{copy.labels.noPropertyLinked}</span>
        ),
    },
    {
      title: copy.columns.appointmentDetails,
      dataIndex: "appointment",
      key: "appointment",
      render: (_: any, record: any) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>{formatDate(record.date)}</span>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs">
              {record.startTime} - {record.endTime}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="line-clamp-1">{record.location}</span>
          </div>
          {record.status === "COMPLETED" ? (
            <span className="mt-1 inline-flex w-max items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              {isVi ? "Hoàn thành" : "Completed"}
            </span>
          ) : (
            <span className="mt-1 inline-flex w-max items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
              {isVi ? "Đã xác nhận" : "Confirmed"}
            </span>
          )}
        </div>
      ),
    },
    {
      title: copy.columns.notes,
      dataIndex: "notes",
      key: "notes",
      render: (_: any, record: any) => (
        <div className="max-w-[250px] space-y-1">
          {record.customerNote && (
            <p className="line-clamp-2 text-xs text-gray-600">
              <span className="font-medium text-gray-800">
                {copy.labels.customerShort}:
              </span>{" "}
              {record.customerNote}
            </p>
          )}
          {record.agentNote && (
            <p className="mt-1 line-clamp-2 text-xs text-blue-600">
              <span className="font-medium text-blue-800">
                {copy.labels.youShort}:
              </span>{" "}
              {record.agentNote}
            </p>
          )}
          {!record.customerNote && !record.agentNote && (
            <span className="text-sm italic text-gray-400">{copy.labels.noNotes}</span>
          )}
        </div>
      ),
    },
    {
      title: copy.columns.actions,
      dataIndex: "actions",
      key: "actions",
      align: "center",
      render: (_: any, record: any) => (
        <div className="flex items-center justify-center gap-2">
          {record.status !== "COMPLETED" && (
            <button
              type="button"
              disabled={isUpdatingSchedule}
              onClick={async () => {
                try {
                  await updateSchedule({
                    id: record._id || record.id,
                    data: {
                      title: record.title,
                      date: record.date,
                      startTime: record.startTime,
                      endTime: record.endTime,
                      location: record.location,
                      type: record.type,
                      status: SCHEDULE_STATUS.COMPLETED,
                      customerName: record.customerName,
                      customerPhone: record.customerPhone,
                      customerEmail: record.customerEmail,
                      customerNote: record.customerNote || "",
                      agentNote: record.agentNote || "",
                      color: record.color,
                    },
                  });
                  toast.success(copy.toasts.appointmentCompleted);
                } catch (_error) {
                  toast.error(copy.toasts.appointmentError);
                }
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              title={copy.actions.complete}
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
          <a
            href={`tel:${record.customerPhone}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
            title={copy.actions.call}
          >
            <Phone className="h-4 w-4" />
          </a>
          <a
            href={`https://zalo.me/${record.customerPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
            title={copy.actions.zalo}
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <a
            href={`mailto:${record.customerEmail}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
            title={copy.actions.email}
          >
            <Mail className="h-4 w-4" />
          </a>
        </div>
      ),
    },
  ];

  const crmTabs = [
    {
      value: "history",
      label: `${copy.tabs.history} (${filteredContactHistory.length})`,
      content: (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50/50 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <History className="h-5 w-5 text-gray-400" />
              {copy.panels.historyTitle}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {copy.panels.historyDescription}
            </p>
          </div>
          <div className="p-1">
            <CsTable
              columns={contactHistoryColumns}
              dataSource={filteredContactHistory}
              loading={isLoadingInquiryLeads || isLoadingSchedules}
              rowKey={(record: CRMContactHistoryRow) => record.id}
              pagination={false}
              emptyText={copy.panels.historyEmpty}
            />
          </div>
        </div>
      ),
    },
    {
      value: "inquiries",
      label: `${copy.tabs.inquiries} (${filteredInquiryLeads.length})`,
      content: (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50/50 p-5">
            <h3 className="text-lg font-semibold text-gray-800">
              {copy.panels.inquiriesTitle}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {copy.panels.inquiriesDescription}
            </p>
          </div>
          <div className="p-1">
            <CsTable
              columns={inquiryColumns}
              dataSource={filteredInquiryLeads}
              loading={isLoadingInquiryLeads}
              rowKey={(record: ILeadDto) => record._id}
              pagination={false}
              emptyText={copy.panels.inquiriesEmpty}
            />
          </div>
        </div>
      ),
    },
    {
      value: "appointments",
      label: `${copy.tabs.appointments} (${filteredLeads.length})`,
      content: (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50/50 p-5">
            <h3 className="text-lg font-semibold text-gray-800">
              {copy.panels.appointmentsTitle}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {copy.panels.appointmentsDescription}
            </p>
          </div>
          <div className="p-1">
            <CsTable
              columns={appointmentColumns}
              dataSource={filteredLeads}
              loading={isLoadingSchedules}
              rowKey={(record: any) => record._id}
              pagination={false}
              emptyText={copy.panels.appointmentsEmpty}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            {copy.header.title}
          </h1>
          <p className="max-w-2xl text-sm text-gray-500 md:text-base">
            {copy.header.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <Download className="h-4 w-4" />
            {copy.header.export}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{copy.stats.total}</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {scheduleContacts.length + inquiryLeads.length}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50">
            <UserRoundPlus className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{copy.stats.inquiries}</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {newInquiryCount}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              {copy.stats.completed}
            </p>
            <h3 className="text-2xl font-bold text-gray-900">
              {completedCount}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50">
            <Calendar className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              {copy.stats.upcoming}
            </p>
            <h3 className="text-2xl font-bold text-gray-900">
              {confirmedCount}
            </h3>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50 p-5 sm:flex-row">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Users className="h-5 w-5 text-gray-400" />
            {copy.searchTitle}
          </h3>
          <div className="relative w-full sm:w-72">
            <Input
              placeholder={copy.searchPlaceholder}
              className="w-full rounded-xl border-gray-200 bg-white py-2 pl-10 pr-4 focus:border-blue-500"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{copy.sectionTitle}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {copy.sectionDescription}
          </p>
        </div>
        <CsTabs item={crmTabs} defaultValue="history" />
      </div>
    </div>
  );
};
