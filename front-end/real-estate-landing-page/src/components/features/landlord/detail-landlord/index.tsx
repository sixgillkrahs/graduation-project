"use client";

import { useParams, useRouter } from "next/navigation";
import { useLandlordDetail, useLandlordProperties } from "../services/query";
import { CsButton } from "@/components/custom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  DollarSign,
} from "lucide-react";
import { CsTable, TableColumn } from "@/components/ui/table";
import { useState } from "react";
import { IParamsPagination } from "@/@types/service";
import { IPropertyDto } from "@/components/features/my-listings/dto/property.dto";

const DetailLandlord = () => {
  const { id } = useParams();
  const router = useRouter();
  const landlordId = (id as string) || "";

  // Landlord Query
  const { data: landlordRes, isLoading: isLoadingLandlord } =
    useLandlordDetail(landlordId);
  const landlord = landlordRes?.data;

  // Properties Query
  const [pagination, setPagination] = useState<IParamsPagination>({
    page: 1,
    limit: 10,
    sortField: "createdAt",
    sortOrder: "desc",
  });

  const { data: propertiesRes, isLoading: isLoadingProperties } =
    useLandlordProperties(landlordId, pagination);
  const properties = propertiesRes?.data?.results || [];
  const totalProperties = propertiesRes?.data?.totalResults || 0;

  const handleBack = () => {
    router.back();
  };

  const columns: TableColumn<IPropertyDto>[] = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (value, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 line-clamp-1">
            {value as string}
          </span>
          <span className="text-xs text-gray-500">
            {record.features?.area} m²
          </span>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "propertyType",
      key: "propertyType",
      render: (value, record) => (
        <div className="flex flex-col">
          <span className="capitalize">
            {(value as string)?.toLowerCase().replace("_", " ")}
          </span>
          <span className="text-xs text-gray-500">
            {record.demandType === "SALE" ? "For Sale" : "For Rent"}
          </span>
        </div>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (value) => {
        const loc = value as IPropertyDto["location"];
        return (
          <span className="text-sm">
            {loc?.district}, {loc?.province}
          </span>
        );
      },
    },
    {
      title: "Price",
      dataIndex: "features",
      key: "price",
      render: (value) => {
        const feat = value as IPropertyDto["features"];
        return (
          <span className="font-semibold text-primary">
            {feat?.price}{" "}
            {feat?.priceUnit === "MILLION" ? "Triệu" : feat?.priceUnit}
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value) => {
        const status = value as string;
        let colorClass = "bg-gray-100 text-gray-800";
        if (status === "PUBLISHED") colorClass = "bg-green-100 text-green-800";
        if (status === "PENDING") colorClass = "bg-yellow-100 text-yellow-800";
        if (status === "REJECTED") colorClass = "bg-red-100 text-red-800";
        if (status === "SOLD") colorClass = "bg-blue-100 text-blue-800";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => (
        <span className="text-gray-500 text-sm">
          {value ? new Date(value as string).toLocaleDateString("vi-VN") : "-"}
        </span>
      ),
    },
  ];

  if (isLoadingLandlord) {
    return (
      <div className="flex h-sc justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!landlord) {
    return (
      <div className="space-y-4">
        <CsButton
          icon={<ArrowLeft className="text-white!" />}
          onClick={handleBack}
          className="bg-white border hover:bg-gray-50 text-gray-700"
        >
          Back
        </CsButton>
        <div className="p-8 text-center bg-gray-50 rounded-lg">
          Landlord not found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-4">
        <CsButton
          icon={<ArrowLeft size={18} className="text-white!" />}
          onClick={handleBack}
          className="bg-white border hover:bg-gray-50 text-gray-700"
        ></CsButton>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landlord Details</h1>
          <p className="text-sm text-gray-500">
            View information and real estate holdings
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-6">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
            {landlord.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {landlord.name}
              </h2>
              <p className="text-sm text-gray-500">
                Member since {new Date(landlord.createdAt || "").getFullYear()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-sm">{landlord.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-sm">{landlord.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-sm truncate" title={landlord.address}>
                  {landlord.address}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg text-gray-900">
              Real Estate ({totalProperties})
            </h3>
          </div>
        </div>

        <div className="p-2">
          <CsTable
            columns={columns}
            dataSource={properties}
            rowKey={(record) => record._id}
            loading={isLoadingProperties}
            emptyText="No real estate properties found for this landlord."
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: totalProperties,
              onChange: (page, pageSize) => {
                setPagination((prev) => ({
                  ...prev,
                  page,
                  limit: pageSize,
                }));
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailLandlord;
