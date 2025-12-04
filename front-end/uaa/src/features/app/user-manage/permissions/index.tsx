import FormPermission from "./components/FormPermission";
import {
  useCreatePermission,
  useDeletePermission,
  useUpdatePermission,
  useUpdatePermissionStatus,
} from "./services/mutation";
import { useGetPermission, useGetPermissions } from "./services/query";
import PermissionService from "./services/service";
import ProTable from "@/components/ProTable";
import { renderConstant } from "@shared/render/const";
import { toVietnamTime } from "@shared/render/time";
import type { IParamsPagination, IResp } from "@shared/types/service";
import { Checkbox } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { Ban, CircleCheckBig } from "lucide-react";
import { useCallback, useState } from "react";

const Permissions = () => {
  const [pagination, setPagination] = useState<IParamsPagination>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading, isFetching, refetch } = useGetPermissions({
    page: pagination.page,
    limit: pagination.limit,
    sortField: pagination.sortField,
    sortOrder: pagination.sortOrder,
    query: pagination.query,
  });
  const { mutateAsync: deletePermission } = useDeletePermission();
  const { mutateAsync: createPermission, isPending: isCreating } = useCreatePermission();
  const { mutateAsync: updatePermission, isPending: isUpdating } = useUpdatePermission();
  const { mutateAsync: updatePermissionStatus, isPending: isUpdatingStatus } =
    useUpdatePermissionStatus();

  const columns: ColumnsType<IPermissionService.PermissionDTO> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Resource",
      dataIndex: "resourceId",
      key: "resourceId",
      render: (value) => value?.name || "-",
    },
    {
      title: "Operation",
      dataIndex: "operation",
      key: "operation",
      render: (value) => renderConstant(value, PermissionService.OPERATION),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "active",
      render: (value) => <Checkbox checked={value} />,
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

  const onChangePage = useCallback(
    (paginationAntd: TablePaginationConfig) => {
      paginationAntd.current = paginationAntd?.current || 1;
      paginationAntd.pageSize = paginationAntd?.pageSize || 10;
      setPagination({
        ...pagination,
        total: data?.data.totalResults || pagination.total, // xét cái này để pagination không bị giật, vì khi đổi page, totalResults có thể không có
        page: paginationAntd?.current || pagination.page,
        limit: paginationAntd?.pageSize || pagination.limit,
      });
    },
    [pagination, data?.data.totalResults],
  );

  const onDelete = (id: string): Promise<IResp<void>> => {
    return deletePermission(id.toString(), {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const onAdd = (values: IPermissionService.CreatePermissionDTO): Promise<any> => {
    return createPermission(values, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const onEdit = (values: IPermissionService.UpdatePermissionDTO): Promise<any> => {
    return updatePermission(values, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const onUpdateStatus = (values: IPermissionService.UpdatePermissionStatusDTO): Promise<any> => {
    return updatePermissionStatus(values, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const extraButton = (record: IPermissionService.PermissionDTO) => [
    {
      key: "changeStatus",
      label: record.isActive ? "Inactivate" : "Activate",
      icon: record.isActive ? <Ban className="h-4 w-4" /> : <CircleCheckBig className="h-4 w-4" />,
      onClick: () =>
        onUpdateStatus({
          id: record.id,
          isActive: !record.isActive,
        }),
    },
  ];

  return (
    <>
      <ProTable<IPermissionService.PermissionDTO>
        key={"permissions-table"}
        columns={columns}
        dataSource={data?.data.results || []}
        isExport={false}
        loading={isLoading || isFetching || isUpdatingStatus}
        pagination={{
          total: data?.data.totalResults || pagination.total,
          current: data?.data.page || pagination.page,
          pageSize: data?.data.limit || pagination.limit,
          onChange: (page, pageSize) => {
            onChangePage({
              current: page,
              pageSize,
            });
          },
        }}
        onDelete={onDelete}
        onAdd={onAdd}
        onEdit={onEdit}
        useGetDetail={useGetPermission}
        extraAction={extraButton}
        form={{
          children: <FormPermission />,
          title: "Permission",
          initialValues: {
            name: "",
            description: "",
            resourceId: "",
            isActive: true,
            operation: "",
          },
          buttonLoading: isCreating || isUpdating || isUpdatingStatus,
        }}
        filter={[
          {
            name: "operation",
            type: "select",
            options: PermissionService.OPERATION.map((item) => ({
              label: item.label,
              value: item.value,
            })),
            placeholder: "Select operation",
          },
          {
            name: "isActive",
            type: "select",
            options: [
              {
                label: "Active",
                value: true,
              },
              {
                label: "Inactive",
                value: false,
              },
            ],
            placeholder: "Select active status",
          },
        ]}
      />
    </>
  );
};

export default Permissions;
