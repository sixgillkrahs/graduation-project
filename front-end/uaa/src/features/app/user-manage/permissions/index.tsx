import FormPermission from "./components/FormPermission";
import {
  useCreatePermission,
  useDeletePermission,
  useUpdatePermission,
  useUpdatePermissionStatus,
} from "./services/mutation";
import { useGetPermission, useGetPermissions } from "./services/query";
import PermissionService from "./services/service";
import FullTable, { type IFilter } from "@/components/FullTable";
import { renderConstant } from "@shared/render/const";
import { toVietnamTime } from "@shared/render/time";
import type { IResp } from "@shared/types/service";
import { Checkbox } from "antd";
import type { ItemType } from "antd/es/menu/interface";
import type { ColumnsType } from "antd/es/table";
import { Ban, CircleCheckBig } from "lucide-react";
import { useCallback } from "react";

const Permissions = () => {
  const { mutateAsync: deletePermission, isPending: isDeleting } = useDeletePermission();
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

  const onDelete = useCallback(
    (id: string): Promise<IResp<void>> => {
      return deletePermission(id.toString());
    },
    [deletePermission],
  );

  const onAdd = useCallback(
    (values: IPermissionService.CreatePermissionDTO): Promise<any> => {
      return createPermission(values);
    },
    [createPermission],
  );

  const onEdit = useCallback(
    (values: IPermissionService.UpdatePermissionDTO): Promise<any> => {
      return updatePermission(values);
    },
    [updatePermission],
  );

  const onUpdateStatus = useCallback(
    (values: IPermissionService.UpdatePermissionStatusDTO): Promise<any> => {
      return updatePermissionStatus(values);
    },
    [updatePermissionStatus],
  );

  const extraButton = useCallback(
    (record: IPermissionService.PermissionDTO): ItemType[] => [
      {
        key: "changeStatus",
        label: record.isActive ? "Inactivate" : "Activate",
        icon: record.isActive ? (
          <Ban className="h-4 w-4" />
        ) : (
          <CircleCheckBig className="h-4 w-4" />
        ),
        onClick: () =>
          onUpdateStatus({
            id: record.id,
            isActive: !record.isActive,
          }),
      },
    ],
    [onUpdateStatus],
  );

  const filter: IFilter<IPermissionService.PermissionDTO>[] = [
    {
      name: "name",
      type: "input",
      placeholder: "Search by name",
    },
    {
      name: "operation",
      type: "select",
      placeholder: "Search by operation",
      options: PermissionService.OPERATION.map((item) => ({
        label: item.label,
        value: item.value,
      })),
    },
    {
      name: "isActive",
      type: "select",
      placeholder: "Search by active status",
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
    },
  ];

  return (
    <>
      <FullTable<IPermissionService.PermissionDTO>
        key={"permissions-table"}
        columns={columns}
        isExport={false}
        useGetList={useGetPermissions}
        extraAction={extraButton}
        form={{
          children: <FormPermission />,
          title: "Permission",
          buttonLoading: isCreating || isUpdating,
        }}
        onAdd={onAdd}
        onDelete={onDelete}
        onEdit={onEdit}
        useGetDetail={useGetPermission}
        loading={isUpdatingStatus || isDeleting}
        filter={filter}
      />
    </>
  );
};

export default Permissions;
