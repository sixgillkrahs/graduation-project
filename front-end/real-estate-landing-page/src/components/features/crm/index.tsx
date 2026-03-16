"use client";

import { format } from "date-fns";
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
import { useMemo, useState } from "react";
import { toast } from "sonner";
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

const leadStatusMeta: Record<LeadStatus, { label: string; className: string }> =
  {
    NEW: {
      label: "New",
      className: "bg-amber-100 text-amber-700",
    },
    CONTACTED: {
      label: "Contacted",
      className: "bg-blue-100 text-blue-700",
    },
    QUALIFIED: {
      label: "Qualified",
      className: "bg-violet-100 text-violet-700",
    },
    SCHEDULED: {
      label: "Scheduled",
      className: "bg-emerald-100 text-emerald-700",
    },
    WON: {
      label: "Won",
      className: "bg-green-100 text-green-700",
    },
    LOST: {
      label: "Lost",
      className: "bg-rose-100 text-rose-700",
    },
  };

const topicLabels: Record<string, string> = {
  PRICE: "Price",
  LEGAL: "Legal",
  LOCATION: "Location",
  NEGOTIATION: "Negotiation",
  VIEWING: "Viewing",
  FURNITURE: "Furniture",
  PAYMENT: "Payment",
};

const intentLabels: Record<string, string> = {
  BUY_TO_LIVE: "Buy to live",
  INVEST: "Investment",
  RENT: "Rent",
  CONSULTATION: "Consultation",
};

const contactTimeLabels: Record<string, string> = {
  ASAP: "ASAP",
  TODAY: "Today",
  NEXT_24_HOURS: "Within 24h",
  THIS_WEEKEND: "This weekend",
};

const contactChannelLabels: Record<string, string> = {
  PHONE: "Phone",
  CHAT: "Chat",
  ZALO: "Zalo",
  EMAIL: "Email",
};

const leadSourceMeta: Record<string, { label: string; className: string }> = {
  PROPERTY_CALL: {
    label: "Call",
    className: "bg-emerald-50 text-emerald-700",
  },
  PROPERTY_CHAT: {
    label: "Chat",
    className: "bg-blue-50 text-blue-700",
  },
  PROPERTY_REQUEST: {
    label: "Request",
    className: "bg-amber-50 text-amber-700",
  },
};

const scheduleStatusMeta: Record<
  SCHEDULE_STATUS,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending approval",
    className: "bg-amber-50 text-amber-700",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-700",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-rose-50 text-rose-700",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-gray-100 text-gray-700",
  },
};

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

const formatDateTime = (value?: string | Date) => {
  if (!value) {
    return "-";
  }

  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    return "-";
  }

  return format(dateValue, "dd MMM, yyyy HH:mm");
};

export const CRMFeature = () => {
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
          customerName: customerName || "Unknown buyer",
          customerPhone: customerPhone || "",
          customerEmail: customerEmail || "",
          listing: listing || null,
          historyItems: [],
          latestActivityAt: "",
          latestActivityTimestamp: 0,
        };
        grouped.set(key, current);
      }
      if (!current.customerName || current.customerName === "Unknown buyer") {
        current.customerName = customerName || "Unknown buyer";
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
        detail: formatDateTime(timestampSource),
        occurredAt: timestampSource,
        timestamp: Number.isNaN(eventTimestamp) ? 0 : eventTimestamp,
        className: sourceMeta.className,
        statusLabel: leadStatusMeta[lead.status]?.label,
        statusClassName: leadStatusMeta[lead.status]?.className,
        note:
          lead.message ||
          (lead.submissionCount > 1
            ? `Re-submitted ${lead.submissionCount} times`
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
        label: "Booked viewing",
        detail: `${formatDateTime(schedule.createdAt || schedule.date)} | ${format(new Date(schedule.date), "dd MMM, yyyy")} | ${schedule.startTime} - ${schedule.endTime}`,
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
      title: "Buyer",
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
              <span>{record.customerPhone || "No phone"}</span>
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
      title: "Listing",
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
                alt={getListingTitle(record.listing) || "Property listing"}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="line-clamp-1 max-w-[220px] font-medium text-gray-900">
                {getListingTitle(record.listing) || "Property listing"}
              </span>
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="line-clamp-1">
                  {getListingAddress(record.listing) || "Address hidden"}
                </span>
              </div>
            </div>
          </button>
        ) : (
          <span className="italic text-gray-400">No property linked</span>
        ),
    },
    {
      title: "Contact history",
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
              +{record.historyItems.length - 3} earlier contact actions
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Last touch",
      dataIndex: "latestActivityAt",
      key: "latestActivityAt",
      render: (_: unknown, record: CRMContactHistoryRow) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-800">
            {record.latestActivityAt}
          </p>
          <p className="text-xs text-gray-500">
            {record.historyItems.length} tracked touchpoint
            {record.historyItems.length > 1 ? "s" : ""}
          </p>
        </div>
      ),
    },
    {
      title: "Actions",
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
                title="Call customer"
              >
                <Phone className="h-4 w-4" />
              </a>
              <a
                href={`https://zalo.me/${record.customerPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
                title="Message via Zalo"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </>
          )}
          {record.customerEmail && (
            <a
              href={`mailto:${record.customerEmail}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
              title="Send email"
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
      title: "Customer",
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
      title: "Property",
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
                alt={record.listingId.title || "Property listing"}
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
          <span className="italic text-gray-400">No property linked</span>
        ),
    },
    {
      title: "Source",
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
              Tracked from property detail
            </p>
          </div>
        );
      },
    },
    {
      title: "Inquiry",
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
            Budget:{" "}
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
      title: "Follow-up",
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
            {format(new Date(record.createdAt), "dd MMM, yyyy HH:mm")}
          </p>
          {record.submissionCount > 1 && (
            <p className="text-xs text-amber-600">
              Re-submitted {record.submissionCount} times
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Status",
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
                toast.success("Lead status updated.");
              } catch (_error) {
                toast.error("Could not update lead status.");
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
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      align: "center",
      render: (_: unknown, record: ILeadDto) => (
        <div className="flex items-center justify-center gap-2">
          <a
            href={`tel:${record.customerPhone}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
            title="Call customer"
          >
            <Phone className="h-4 w-4" />
          </a>
          <a
            href={`https://zalo.me/${record.customerPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
            title="Message via Zalo"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          {record.customerEmail && (
            <a
              href={`mailto:${record.customerEmail}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
              title="Send email"
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
      title: "Customer Info",
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
      title: "Property of Interest",
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
                alt={record.listingId.title || "Property listing"}
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
          <span className="italic text-gray-400">No property linked</span>
        ),
    },
    {
      title: "Appointment Details",
      dataIndex: "appointment",
      key: "appointment",
      render: (_: any, record: any) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>{format(new Date(record.date), "dd MMM, yyyy")}</span>
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
              Completed
            </span>
          ) : (
            <span className="mt-1 inline-flex w-max items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
              Confirmed
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (_: any, record: any) => (
        <div className="max-w-[250px] space-y-1">
          {record.customerNote && (
            <p className="line-clamp-2 text-xs text-gray-600">
              <span className="font-medium text-gray-800">Cust:</span>{" "}
              {record.customerNote}
            </p>
          )}
          {record.agentNote && (
            <p className="mt-1 line-clamp-2 text-xs text-blue-600">
              <span className="font-medium text-blue-800">You:</span>{" "}
              {record.agentNote}
            </p>
          )}
          {!record.customerNote && !record.agentNote && (
            <span className="text-sm italic text-gray-400">No notes</span>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
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
                  toast.success("Appointment marked as completed.");
                } catch (_error) {
                  toast.error("Could not update appointment status.");
                }
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              title="Mark as completed"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
          <a
            href={`tel:${record.customerPhone}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
            title="Call customer"
          >
            <Phone className="h-4 w-4" />
          </a>
          <a
            href={`https://zalo.me/${record.customerPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
            title="Message via Zalo"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <a
            href={`mailto:${record.customerEmail}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
            title="Send Email"
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
      label: `Contact history (${filteredContactHistory.length})`,
      content: (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50/50 p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <History className="h-5 w-5 text-gray-400" />
              Contact history by buyer and listing
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Unified timeline showing which buyer called, chatted, sent a
              request, or booked a viewing from each listing.
            </p>
          </div>
          <div className="p-1">
            <CsTable
              columns={contactHistoryColumns}
              dataSource={filteredContactHistory}
              loading={isLoadingInquiryLeads || isLoadingSchedules}
              rowKey={(record: CRMContactHistoryRow) => record.id}
              pagination={false}
              emptyText="No contact history yet. Calls, chats, requests, and viewing bookings will appear here."
            />
          </div>
        </div>
      ),
    },
    {
      value: "inquiries",
      label: `New inquiries (${filteredInquiryLeads.length})`,
      content: (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50/50 p-5">
            <h3 className="text-lg font-semibold text-gray-800">
              New inquiries
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Leads tracked from the property detail Call, Chat, and Send
              request actions.
            </p>
          </div>
          <div className="p-1">
            <CsTable
              columns={inquiryColumns}
              dataSource={filteredInquiryLeads}
              loading={isLoadingInquiryLeads}
              rowKey={(record: ILeadDto) => record._id}
              pagination={false}
              emptyText="No inquiries yet. New request-info submissions will appear here."
            />
          </div>
        </div>
      ),
    },
    {
      value: "appointments",
      label: `Appointments (${filteredLeads.length})`,
      content: (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50/50 p-5">
            <h3 className="text-lg font-semibold text-gray-800">
              Qualified leads from appointments
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Confirmed or completed viewing requests that have already moved
              deeper into the funnel.
            </p>
          </div>
          <div className="p-1">
            <CsTable
              columns={appointmentColumns}
              dataSource={filteredLeads}
              loading={isLoadingSchedules}
              rowKey={(record: any) => record._id}
              pagination={false}
              emptyText="No appointment leads yet. Confirmed viewing requests will appear here."
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
            Leads & CRM
          </h1>
          <p className="max-w-2xl text-sm text-gray-500 md:text-base">
            Capture fresh inquiries from listing detail pages, follow up fast,
            and convert qualified prospects into appointments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Leads</p>
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
            <p className="text-sm font-medium text-gray-500">New Inquiries</p>
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
              Completed Viewings
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
              Upcoming Appointments
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
            Search across inquiries and appointments
          </h3>
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Search customers, emails or properties..."
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
          <h3 className="text-lg font-semibold text-gray-800">CRM sections</h3>
          <p className="mt-1 text-sm text-gray-500">
            Switch between tabs to review contact history, new inquiries, and
            appointment leads without making the page too long.
          </p>
        </div>
        <CsTabs item={crmTabs} defaultValue="history" />
      </div>
    </div>
  );
};
