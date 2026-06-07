import React from "react";
import { Dropdown, DropdownItem, Icon } from "@/components/ui";
import { MapPin, AlertCircle } from "lucide-react";
import { useLocale } from "next-intl";

interface ListingHeaderProps {
  property: any;
  isUpdating: boolean;
  onUpdateStatus: (status: any) => void;
  onOpenSoldModal: () => void;
  onBack: () => void;
  onEdit: () => void;
  onView: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700 border-green-200",
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  SOLD: "bg-blue-100 text-blue-700 border-blue-200",
  EXPIRED: "bg-orange-100 text-orange-700 border-orange-200",
};

export const ListingHeader = React.memo(
  ({
    property,
    isUpdating,
    onUpdateStatus,
    onOpenSoldModal,
    onBack,
    onEdit,
    onView,
  }: ListingHeaderProps) => {
    const locale = useLocale();
    const isVi = locale === "vi";
    const getStatusColor = (status: string) =>
      STATUS_COLORS[status] || STATUS_COLORS["DRAFT"];
    const getStatusLabel = (status: string) => {
      if (!isVi) return status;

      switch (status) {
        case "PUBLISHED":
          return "Đang hiển thị";
        case "PENDING":
          return "Chờ duyệt";
        case "DRAFT":
          return "Bản nháp";
        case "REJECTED":
          return "Bị từ chối";
        case "SOLD":
          return "Đã bán";
        case "EXPIRED":
          return "Đã ẩn";
        default:
          return status;
      }
    };

    return (
      <>
        {/* Header section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1
                className="text-2xl font-bold text-gray-900 border-b-2 border-transparent hover:border-blue-600 transition cursor-pointer"
                onClick={onView}
              >
                {property.title}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                  property.status,
                )}`}
              >
                {getStatusLabel(property.status)}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500 gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              {property.location.address}, {property.location.ward},{" "}
              {property.location.province}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              {isVi ? "Quay lại" : "Back"}
            </button>

            {(property.status === "PUBLISHED" ||
              property.status === "SOLD" ||
              property.status === "EXPIRED") && (
              <Dropdown
                width={220}
                placement="bottom"
                trigger={
                  <button
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-600 border border-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                  >
                    <Icon.Settings className="w-4 h-4" />
                    {isUpdating
                      ? isVi
                        ? "Đang cập nhật..."
                        : "Updating..."
                      : isVi
                        ? "Đổi trạng thái"
                        : "Change Status"}
                  </button>
                }
              >
                <div className="py-2 z-50">
                  {property.status !== "SOLD" && (
                    <DropdownItem onClick={onOpenSoldModal}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        {isVi ? "Đánh dấu đã bán" : "Mark as Sold"}
                      </div>
                    </DropdownItem>
                  )}
                  {property.status !== "PUBLISHED" && (
                    <DropdownItem onClick={() => onUpdateStatus("PUBLISHED")}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        {isVi ? "Đánh dấu đã đăng" : "Mark as Published"}
                      </div>
                    </DropdownItem>
                  )}
                  {property.status !== "EXPIRED" && (
                    <DropdownItem
                      onClick={() => onUpdateStatus("EXPIRED")}
                      danger
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        {isVi ? "Ẩn tin (hết hạn)" : "Hide (Expired)"}
                      </div>
                    </DropdownItem>
                  )}
                </div>
              </Dropdown>
            )}

            <button
              onClick={onEdit}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
            >
              <Icon.Edit className="w-4 h-4" />
              {isVi ? "Sửa tin đăng" : "Edit Property"}
            </button>
          </div>
        </div>

        {property.rejectReason && property.status === "REJECTED" && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex gap-3 text-red-800 shrink-0">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="flex flex-col text-sm">
              <span className="font-semibold">
                {isVi
                  ? "Tin đăng bị quản trị viên từ chối"
                  : "Property Rejected by Admin"}
              </span>
              <span>
                {isVi ? "Lý do" : "Reason"}: {property.rejectReason}
              </span>
            </div>
          </div>
        )}
      </>
    );
  },
);

ListingHeader.displayName = "ListingHeader";
