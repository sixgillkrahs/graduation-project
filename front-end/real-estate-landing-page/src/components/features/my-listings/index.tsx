"use client";

import { Button, Icon, Table, TableColumn } from "@/components/ui";
import { useState } from "react";

const MyListings = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 20,
  });
  const columns: TableColumn<any>[] = [
    {
      title: "Property details",
      dataIndex: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Performance",
      dataIndex: "performance",
    },
    {
      title: "Price & Date",
      dataIndex: "price",
    },
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      width: "10%",
      render: () => {
        return (
          <div className="flex gap-2 justify-end">
            <Button icon={<Icon.Eye className="w-5 h-5" />} />
            <Button icon={<Icon.Edit className="w-5 h-5" />} />
            <Button icon={<Icon.MoreVertical className="w-5 h-5" />} />
          </div>
        );
      },
    },
  ];

  const dataSource = [
    {
      name: "Property 1",
      status: "Active",
      performance: "Good",
      price: "1000",
    },
  ];

  return (
    <div className="grid gap-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="cs-typography font-bold!">My Properties</div>
          <div className="cs-paragraph-gray font-bold! text-sm!">
            Manage your active and pas listings
          </div>
        </div>
        <div>
          <Button icon={<Icon.Plus />} className="cs-bg-black text-white">
            Create New Listing
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={"name"}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination({
              current: page,
              pageSize,
              total: pagination.total,
            });
          },
        }}
      />
    </div>
  );
};

export default MyListings;
