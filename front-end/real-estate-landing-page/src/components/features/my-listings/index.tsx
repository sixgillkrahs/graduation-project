"use client";

import type { IParamsPagination } from "@/@types/service";
import { CsButton } from "@/components/custom";
import { Dropdown, DropdownItem, Icon, Image } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { CsTable, TableColumn } from "@/components/ui/table";
import { ROUTES } from "@/const/routes";
import { LIST_PROVINCE, LIST_WARD, findOptionLabel } from "gra-helper";
import { Building2, Eye, Plus, Search, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { IPropertyDto } from "./dto/property.dto";
import { useGetMyProperties } from "./services/query";
import { formatPropertyPrice } from "@/lib/property-price";

type ListingFilters = {
  query: string;
  status: string;
  propertyType: string;
  demandType: string;
};

const defaultFilters: ListingFilters = {
  query: "",
  status: "",
  propertyType: "",
  demandType: "",
};

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Pending", value: "PENDING" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Sold", value: "SOLD" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Draft", value: "DRAFT" },
];

const propertyTypeOptions = [
  { label: "All property types", value: "" },
  { label: "Apartment", value: "APARTMENT" },
  { label: "House", value: "HOUSE" },
  { label: "Street House", value: "STREET_HOUSE" },
  { label: "Villa", value: "VILLA" },
  { label: "Land", value: "LAND" },
  { label: "Other", value: "OTHER" },
];

const demandTypeOptions = [
  { label: "All demands", value: "" },
  { label: "Sale", value: "SALE" },
  { label: "Rent", value: "RENT" },
];

const MyListings = () => {
  const router = useRouter();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [draftFilters, setDraftFilters] = useState<ListingFilters>(defaultFilters);
  const [filters, setFilters] = useState<ListingFilters>(defaultFilters);

  const params = useMemo<IParamsPagination>(() => {
    const nextParams: IParamsPagination = {
      page: pagination.current,
      limit: pagination.pageSize,
    };

    for (const [key, value] of Object.entries(filters)) {
      const normalizedValue = value.trim();
      if (normalizedValue) {
        nextParams[key] = normalizedValue;
      }
    }

    return nextParams;
  }, [filters, pagination.current, pagination.pageSize]);

  const { data, isLoading } = useGetMyProperties(params);

  const handleDraftFilterChange = (
    key: keyof ListingFilters,
    value: string,
  ) => {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
    setFilters(draftFilters);
  };

  const handleResetFilters = () => {
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
    setDraftFilters(defaultFilters);
    setFilters(defaultFilters);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const columns: TableColumn<IPropertyDto>[] = [
    {
      title: "Property details",
      dataIndex: "title",
      width: "30%",
      render: (_, record) => (
        <div className="flex gap-3">
          <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
            {record.media?.thumbnail ? (
              <Image
                src={record.media.thumbnail}
                alt="Property"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Building2 className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <h4
              className="font-semibold text-gray-900 line-clamp-1 cursor-pointer hover:text-blue-600 transition"
              onClick={() => router.push(`/agent/listings/${record.id}`)}
              title="Click to view details"
            >
              {record.title ||
                `${record.propertyType} - ${record.location.province}`}
            </h4>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
              {record.location.address},{" "}
              {findOptionLabel(record.location.ward, LIST_WARD)},{" "}
              {findOptionLabel(record.location.province, LIST_PROVINCE)}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: "15%",
      render: (status: any) => {
        const colorMap: Record<string, string> = {
          PUBLISHED: "text-green-600 bg-green-50",
          PENDING: "text-yellow-600 bg-yellow-50",
          DRAFT: "text-gray-600 bg-gray-50",
          REJECTED: "text-red-600 bg-red-50",
          SOLD: "text-blue-600 bg-blue-50",
          EXPIRED: "text-orange-600 bg-orange-50",
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              colorMap[status] || "text-gray-600 bg-gray-50"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      title: "Performance",
      dataIndex: "viewCount",
      width: "10%",
      render: (viewCount) => (
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-700">
            {viewCount?.toLocaleString() || 0}
          </span>
          <span className="text-xs text-gray-400">views</span>
        </div>
      ),
    },
    {
      title: "Price & Date",
      dataIndex: "features",
      width: "15%",
      render: (features: any, record) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-gray-900">
            {formatPropertyPrice(
              features?.price,
              features?.priceUnit,
              features?.currency,
            )}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(record.createdAt).toLocaleDateString("en-GB")}
          </div>
        </div>
      ),
    },
    {
      title: "Reason",
      dataIndex: "rejectReason",
      width: "15%",
      render: (reason: any, record) => {
        if (record.status !== "REJECTED" || !reason) {
          return <span className="text-gray-400 text-sm">-</span>;
        }
        return (
          <div
            className="text-sm text-red-600 line-clamp-2 font-medium"
            title={reason}
          >
            {reason}
          </div>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "id",
      align: "center",
      width: "15%",
      render: (_, record, rowIndex) => {
        console.log(record);
        const isPending = record.status === "PENDING";
        const canSubmitApproval =
          record.status === "REJECTED" || record.status === "DRAFT";

        // Detect if it's the last or second to last item to flip the dropdown upward
        const isBottomRow =
          rowIndex !== undefined && data?.data?.results?.length
            ? data.data.results.length > 3 &&
              rowIndex >= data.data.results.length - 2
            : false;

        return (
          <div className="flex gap-2 justify-center items-center">
            <Dropdown
              width={160}
              placement={isBottomRow ? "top" : "bottom"}
              trigger={
                <CsButton
                  icon={<Icon.MoreVertical className="w-4 h-4" />}
                  disabled={isPending}
                  title={
                    isPending
                      ? "Đang chờ duyệt, không thể thao tác"
                      : "Hành động khác"
                  }
                />
              }
            >
              <div className="py-2">
                <DropdownItem
                  icon={<Eye className="w-4 h-4" />}
                  onClick={() => router.push(`/agent/listings/${record.id}`)}
                >
                  Xem chi tiết
                </DropdownItem>
                <DropdownItem
                  icon={<Icon.Edit className="w-4 h-4" />}
                  onClick={() =>
                    router.push(`/agent/listings/edit/${record.id}`)
                  }
                >
                  Chỉnh sửa
                </DropdownItem>

                {canSubmitApproval && (
                  <DropdownItem icon={<Send className="w-4 h-4" />}>
                    Gửi duyệt
                  </DropdownItem>
                )}

                <DropdownItem icon={<Trash2 className="w-4 h-4" />} danger>
                  Xóa
                </DropdownItem>
              </div>
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <div className="grid gap-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="cs-typography font-bold text-2xl">My Properties</div>
          <div className="cs-paragraph-gray mt-1">
            Manage your active and past listings
          </div>
        </div>
      <div>
          <CsButton
            icon={<Plus />}
            className="cs-bg-black text-white px-4"
            onClick={() => router.push(ROUTES.AGENT_LISTINGS_ADD)}
          >
            Create New Listing
          </CsButton>
        </div>
      </div>
      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <form
          className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto_auto] lg:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            handleApplyFilters();
          }}
        >
          <Input
            label="Search"
            placeholder="Title, address, province..."
            preIcon={<Search className="h-4 w-4" />}
            value={draftFilters.query}
            onChange={(event) =>
              handleDraftFilterChange("query", event.target.value)
            }
          />

          <label className="grid gap-2 text-sm font-medium text-gray-700">
            <span>Status</span>
            <select
              className="h-11 rounded-xl border border-gray-200 bg-transparent px-3 text-sm outline-none transition focus:border-black"
              value={draftFilters.status}
              onChange={(event) =>
                handleDraftFilterChange("status", event.target.value)
              }
            >
              {statusOptions.map((option) => (
                <option key={option.value || "all-status"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-gray-700">
            <span>Demand</span>
            <select
              className="h-11 rounded-xl border border-gray-200 bg-transparent px-3 text-sm outline-none transition focus:border-black"
              value={draftFilters.demandType}
              onChange={(event) =>
                handleDraftFilterChange("demandType", event.target.value)
              }
            >
              {demandTypeOptions.map((option) => (
                <option key={option.value || "all-demand"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-gray-700">
            <span>Property Type</span>
            <select
              className="h-11 rounded-xl border border-gray-200 bg-transparent px-3 text-sm outline-none transition focus:border-black"
              value={draftFilters.propertyType}
              onChange={(event) =>
                handleDraftFilterChange("propertyType", event.target.value)
              }
            >
              {propertyTypeOptions.map((option) => (
                <option key={option.value || "all-type"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <CsButton type="submit" className="h-11 px-5 cs-bg-black text-white">
            Apply
          </CsButton>

          <CsButton
            type="button"
            className="h-11 px-5"
            onClick={handleResetFilters}
          >
            Reset
          </CsButton>
        </form>

        <div className="mt-3 text-sm text-gray-500">
          {activeFilterCount > 0
            ? `${activeFilterCount} active filter${activeFilterCount > 1 ? "s" : ""}`
            : "No filters applied"}
        </div>
      </div>
      <CsTable
        columns={columns}
        dataSource={data?.data.results || []}
        rowKey={"id"}
        loading={isLoading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: data?.data.totalResults || 0,
          onChange: (page, pageSize) => {
            setPagination({
              current: page,
              pageSize,
            });
          },
        }}
      />
    </div>
  );
};

export default MyListings;
