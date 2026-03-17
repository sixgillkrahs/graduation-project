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
import {
  getLocalizedOperationLabel,
  getLocalizedPermissionLabel,
  getLocalizedResourceLabel,
} from "@shared/i18n/accessControl";
import { renderConstant } from "@shared/render/const";
import { toVietnamTime } from "@shared/render/time";
import type { IResp } from "@shared/types/service";
import { Checkbox } from "antd";
import type { ItemType } from "antd/es/menu/interface";
import type { ColumnsType } from "antd/es/table";
import { Ban, CircleCheckBig } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

const Permissions = () => {
  const { t } = useTranslation();
  const { mutateAsync: deletePermission, isPending: isDeleting } = useDeletePermission();
  const { mutateAsync: createPermission, isPending: isCreating } = useCreatePermission();
  const { mutateAsync: updatePermission, isPending: isUpdating } = useUpdatePermission();
  const { mutateAsync: updatePermissionStatus, isPending: isUpdatingStatus } =
    useUpdatePermissionStatus();

  const columns: ColumnsType<IPermissionService.PermissionDTO> = [
    {
      title: t("permission.column.name"),
      dataIndex: "name",
      key: "name",
      render: (_value, record) => getLocalizedPermissionLabel(record, t),
    },
    {
      title: t("permission.column.resource"),
      dataIndex: "resourceId",
      key: "resourceId",
      render: (value) => getLocalizedResourceLabel(value, t),
    },
    {
      title: t("permission.column.operation"),
      dataIndex: "operation",
      key: "operation",
      render: (value) =>
        renderConstant(value, PermissionService.OPERATION.map((item) => ({
          ...item,
          label: getLocalizedOperationLabel(item.value, t),
        }))),
    },
    {
      title: t("permission.column.active"),
      dataIndex: "isActive",
      key: "active",
      render: (value) => <Checkbox checked={value} />,
    },
    {
      title: t("permission.column.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => toVietnamTime(value),
      sorter: true,
      width: 230,
    },
    {
      title: t("permission.column.updatedAt"),
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
    (values: IPermissionService.PermissionDTO): Promise<any> => {
      return updatePermission({
        ...values,
        name:
          typeof values.name === "string"
            ? {
                en: values.name,
                vi: values.name,
              }
            : values.name,
        resourceId:
          typeof values.resourceId === "string"
            ? values.resourceId
            : values.resourceId.id,
      });
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
        label: record.isActive
          ? t("permission.column.inactivate")
          : t("permission.column.activate"),
        icon: record.isActive ? (
          <Ban className="h-3 w-3" />
        ) : (
          <CircleCheckBig className="h-3 w-3" />
        ),
        onClick: () =>
          onUpdateStatus({
            id: record.id,
            isActive: !record.isActive,
          }),
      },
    ],
    [onUpdateStatus, t],
  );

  const filter: IFilter<IPermissionService.PermissionDTO>[] = [
    {
      name: "name",
      type: "input",
      placeholder: t("permission.placeholder.name"),
    },
    {
      name: "operation",
      type: "select",
      placeholder: t("permission.placeholder.operation"),
      options: PermissionService.OPERATION.map((item) => ({
        label: getLocalizedOperationLabel(item.value, t),
        value: item.value,
      })),
    },
    {
      name: "isActive",
      type: "select",
      placeholder: t("permission.placeholder.activeStatus"),
      options: [
        {
          label: t("permission.column.active"),
          value: true,
        },
        {
          label: t("permission.column.inactivate"),
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
