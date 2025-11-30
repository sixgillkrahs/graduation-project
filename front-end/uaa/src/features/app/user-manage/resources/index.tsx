import FormResource from "./components/FormResource";
import { useCreateResource, useDeleteResource } from "./services/mutation";
import { useGetResources } from "./services/query";
import ProTable from "@/components/ProTable";
import { toVietnamTime } from "@shared/render/time";
import type { IParamsPagination } from "@shared/types/service";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

const Resources = () => {
  const { mutate: deleteResource } = useDeleteResource();
  const { mutate: createResource } = useCreateResource();
  const [pagination, setPagination] = useState<IParamsPagination>({
    page: 1,
    limit: 10,
    sortField: "createdAt",
    sortOrder: "asc",
    total: 0,
  });
  const { data, isLoading } = useGetResources({
    page: pagination.page,
    limit: pagination.limit,
    sortField: pagination.sortField,
    sortOrder: pagination.sortOrder,
  });

  const columns: ColumnsType<IResourceService.ResourceDTO> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Path",
      dataIndex: "path",
      key: "path",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => toVietnamTime(value),
      sorter: true,
      width: 230,
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value) => toVietnamTime(value),
      sorter: true,
      width: 230,
    },
  ];

  const onAdd = (values: IResourceService.CreateResourceDTO) => {
    createResource(values);
    setPagination({
      ...pagination,
      total: data?.data.totalResults || pagination.total,
      page: data?.data.page || pagination.page,
      limit: data?.data.limit || pagination.limit,
    });
  };

  const onDelete = (id: string) => {
    deleteResource(id.toString());
  };

  return (
    <ProTable<IResourceService.ResourceDTO>
      columns={columns}
      dataSource={data?.data.results || []}
      loading={isLoading}
      onDelete={onDelete}
      pagination={{
        total: data?.data.totalResults || pagination.total,
        current: data?.data.page || pagination.page,
        pageSize: data?.data.limit || pagination.limit,
        onChange: (page, pageSize) => {
          setPagination({
            ...pagination,
            total: data?.data.totalResults || pagination.total,
            page,
            limit: pageSize,
          });
        },
      }}
      onAdd={onAdd}
      form={{
        title: "Add New Resource",
        children: ({ form }) => <FormResource form={form} />,
      }}
    />
  );
};

export default Resources;
