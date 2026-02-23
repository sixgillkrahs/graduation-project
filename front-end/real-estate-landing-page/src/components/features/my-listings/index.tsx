"use client";

import { Icon, Image } from "@/components/ui";
import { useState } from "react";
import { useGetMyProperties } from "./services/query";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/const/routes";
import { Building2, Eye, Plus } from "lucide-react";
import { CsButton } from "@/components/custom";
import { IPropertyDto } from "./dto/property.dto";
import { CsTable, TableColumn } from "@/components/ui/table";
import { findOptionLabel } from "@/shared/helper/findOptionValue";
import PropertyService from "./services/service";

const MyListings = () => {
  const router = useRouter();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { data, isLoading } = useGetMyProperties({
    page: pagination.current,
    limit: pagination.pageSize,
  });

  const columns: TableColumn<IPropertyDto>[] = [
    {
      title: "Property details",
      dataIndex: "title",
      width: "30%",
      render: (_, record) => (
        <div className="flex gap-3">
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
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
            <h4 className="font-semibold text-gray-900 line-clamp-1">
              {record.title ||
                `${record.propertyType} - ${record.location.province}`}
            </h4>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
              {record.location.address},{" "}
              {findOptionLabel(record.location.ward, PropertyService.Wards)},{" "}
              {findOptionLabel(
                record.location.province,
                PropertyService.Provinces,
              )}
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
      width: "20%",
      render: (features: any, record) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-gray-900">
            {features?.price} {features?.priceUnit}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(record.createdAt).toLocaleDateString("en-GB")}
          </div>
        </div>
      ),
    },
    {
      title: "Action",
      dataIndex: "_id",
      align: "center",
      width: "10%",
      render: () => {
        return (
          <div className="flex gap-2 justify-end">
            <CsButton icon={<Eye className="w-4 h-4" />} />
            <CsButton icon={<Icon.Edit className="w-4 h-4" />} />
            <CsButton icon={<Icon.MoreVertical className="w-4 h-4" />} />
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
      <CsTable
        columns={columns}
        dataSource={data?.data.results || []}
        rowKey={"_id"}
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
