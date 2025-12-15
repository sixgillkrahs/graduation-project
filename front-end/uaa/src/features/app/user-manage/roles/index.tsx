import FormRole from "./components/FormRole";
import { useCreateRole } from "./services/mutate";
import { useGetRoles } from "./services/query";
import FullTable from "@/components/FullTable";
import { toVietnamTime } from "@shared/render/time";
import { Checkbox } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

const Roles = () => {
  const { t } = useTranslation();
  const { mutateAsync: createRole, isPending: isCreating } = useCreateRole();
  const columns: ColumnsType<IRoleService.RoleDTO> = [
    {
      title: t("roles.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("roles.active"),
      dataIndex: "isActive",
      key: "isActive",
      render: (value) => <Checkbox checked={value} />,
    },
    {
      title: t("roles.default"),
      dataIndex: "isDefault",
      key: "isDefault",
      render: (value) => <Checkbox checked={value} />,
    },
    {
      title: t("roles.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => toVietnamTime(value),
    },
    {
      title: t("roles.updatedAt"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value) => toVietnamTime(value),
    },
  ];

  const onAdd = useCallback(
    (values: IRoleService.CreateRoleDTO): Promise<any> => {
      return createRole(values);
    },
    [createRole],
  );

  return (
    <FullTable<IRoleService.RoleDTO>
      key={"roles-table"}
      columns={columns}
      isExport={false}
      useGetList={useGetRoles}
      // extraAction={extraButton}
      form={{
        children: <FormRole />,
        title: t("roles.title"),
        buttonLoading: isCreating,
      }}
      onAdd={onAdd}
      // onDelete={onDelete}
      // onEdit={onEdit}
      // useGetDetail={useGetPermission}
      // loading={isUpdatingStatus || isDeleting}
      // filter={filter}
    />
  );
};

export default Roles;
