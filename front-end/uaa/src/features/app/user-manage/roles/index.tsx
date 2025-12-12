import FormRole from "./components/FormRole";
import { useCreateRole } from "./services/mutate";
import { useGetRoles } from "./services/query";
import FullTable from "@/components/FullTable";
import { toVietnamTime } from "@shared/render/time";
import { Checkbox } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback } from "react";

const Roles = () => {
  const { mutateAsync: createRole, isPending: isCreating } = useCreateRole();
  const columns: ColumnsType<IRoleService.RoleDTO> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (value) => <Checkbox checked={value} />,
    },
    {
      title: "Default",
      dataIndex: "isDefault",
      key: "isDefault",
      render: (value) => <Checkbox checked={value} />,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => toVietnamTime(value),
    },
    {
      title: "Updated At",
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
        title: "Role",
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
