import { useGetLeads } from "@/components/features/schedule/services/query";
import { CsTable } from "@/components/ui/table";
import { format } from "date-fns";
import {
  MapPin,
  Mail,
  Phone,
  Calendar,
  Search,
  Users,
  Home as HomeIcon,
  CheckCircle2,
  Download,
  MessageCircle,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui";

export const CRMFeature = () => {
  const { data: leadsResponse, isLoading } = useGetLeads();
  const leads = leadsResponse?.data || [];

  const columns: any[] = [
    {
      title: "Customer Info",
      dataIndex: "customerInfo",
      key: "customerInfo",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {record.customerName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {record.customerName}
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Phone className="w-3.5 h-3.5" />
              <span>{record.customerPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="w-3.5 h-3.5" />
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
          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            onClick={() =>
              window.open(
                `/agent/listings/${record.listingId._id || record.listingId.id}`,
                "_blank",
              )
            }
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-200">
              <img
                src={
                  record.listingId.media?.thumbnail ||
                  record.listingId.media?.images?.[0] ||
                  "https://via.placeholder.com/150"
                }
                alt={record.listingId.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 line-clamp-1 max-w-[200px]">
                {record.listingId.title}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="line-clamp-1">
                  {record.listingId.location?.address}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 italic">No property linked</span>
        ),
    },
    {
      title: "Appointment Details",
      dataIndex: "appointment",
      key: "appointment",
      render: (_: any, record: any) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{format(new Date(record.date), "dd MMM, yyyy")}</span>
            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-md">
              {record.startTime} - {record.endTime}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="line-clamp-1">{record.location}</span>
          </div>
          {record.status === "COMPLETED" ? (
            <span className="inline-flex items-center px-2 py-1 mt-1 rounded-full text-xs font-medium bg-green-100 text-green-700 w-max">
              Completed
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 mt-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 w-max">
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
        <div className="flex flex-col gap-1 max-w-[250px]">
          {record.customerNote && (
            <p className="text-xs text-gray-600 line-clamp-2">
              <span className="font-medium text-gray-800">Cust:</span>{" "}
              {record.customerNote}
            </p>
          )}
          {record.agentNote && (
            <p className="text-xs text-blue-600 line-clamp-2 mt-1">
              <span className="font-medium text-blue-800">You:</span>{" "}
              {record.agentNote}
            </p>
          )}
          {!record.customerNote && !record.agentNote && (
            <span className="text-gray-400 italic text-sm">No notes</span>
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
          <a
            href={`tel:${record.customerPhone}`}
            className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"
            title="Call customer"
          >
            <Phone className="w-4 h-4" />
          </a>
          <a
            href={`https://zalo.me/${record.customerPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors"
            title="Message via Zalo"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <a
            href={`mailto:${record.customerEmail}`}
            className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors"
            title="Send Email"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>
      ),
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");

  const filteredLeads = useMemo(() => {
    if (!searchTerm) return leads;
    return leads.filter(
      (lead: any) =>
        lead.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.customerPhone?.includes(searchTerm) ||
        lead.listingId?.title?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [leads, searchTerm]);

  // Derived metrics
  const completedCount = leads.filter(
    (l: any) => l.status === "COMPLETED",
  ).length;
  const confirmedCount = leads.length - completedCount;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Leads & CRM
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl">
            Manage your prospective clients, track property viewings, and close
            deals effortlessly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Leads</p>
            <h3 className="text-2xl font-bold text-gray-900">{leads.length}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
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
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-amber-600" />
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            Customer Contact List
          </h3>
          <div className="w-full sm:w-72 relative">
            <Input
              placeholder="Search customers, emails or properties..."
              className="pl-10 pr-4 py-2 w-full bg-white border-gray-200 focus:border-blue-500 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div className="p-1">
          <CsTable
            columns={columns}
            dataSource={filteredLeads}
            loading={isLoading}
            rowKey={(record: any) => record._id}
            pagination={false}
            emptyText="No leads yet. When a customer's appointment gets confirmed, they will appear here."
          />
        </div>
      </div>
    </div>
  );
};
