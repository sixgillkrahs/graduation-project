import FormRole, { type FormRef } from "./components/FormRole";
import { useDeleteRole } from "./services/mutate";
import { useGetRoles } from "./services/query";
import FullTable from "@/components/FullTable";
import { toVietnamTime } from "@shared/render/time";
import { Button, Checkbox, Dropdown, Flex, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EllipsisVertical, Eye, Pencil, PlusIcon, Trash } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

const Roles = () => {
  const { mutateAsync: deleteRole } = useDeleteRole();
  const [modal, contextHolder] = Modal.useModal();
  const { t } = useTranslation();
  const ref = useRef<FormRef>(null);
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
      sorter: true,
      render: (value) => toVietnamTime(value),
    },
    {
      title: t("columns.action"),
      dataIndex: "action",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "view",
                label: t("button.view"),
                icon: <Eye className="h-4 w-4" />,
                onClick: () => handleView(record),
              },
              {
                key: "edit",
                label: t("button.edit"),
                icon: <Pencil className="h-4 w-4" />,
                // onClick: () => handleEdit(record),
              },
              { type: "divider" as const },
              {
                key: "delete",
                label: t("button.delete"),
                icon: <Trash className="h-4 w-4" />,
                danger: true,
                onClick: () => handleDelete(record.id),
              },
            ],
          }}
        >
          <EllipsisVertical className="cursor-pointer" />
        </Dropdown>
      ),
    },
  ];

  console.log("home");

  const onAdd = () => {
    ref.current?.open();
  };

  function handleView(_: IRoleService.RoleDTO) {}

  // const onAdd = useCallback(
  //   (values: IRoleService.CreateRoleDTO): Promise<any> => {
  //     return createRole(values);
  //   },
  //   [createRole],
  // );

  function handleDelete(id: string) {
    modal.confirm({
      title: t("confirm.delete.title"),
      content: t("confirm.delete.content"),
      okText: t("button.delete"),
      okType: "danger",
      onOk: () => {
        return deleteRole(id);
      },
      cancelText: t("button.cancel"),
    });
  }

  return (
    <div>
      <Flex justify="flex-end">
        <Button
          type="primary"
          htmlType="submit"
          loading={false}
          icon={<PlusIcon />}
          onClick={onAdd}
        >
          {t("button.add")}
        </Button>
      </Flex>
      <FullTable<IRoleService.RoleDTO>
        key={"roles-table"}
        columns={columns}
        isExport={false}
        useGetList={useGetRoles}
        // extraAction={extraButton}
        // form={{
        //   children: <FormRole />,
        //   title: t("roles.title"),
        //   buttonLoading: isCreating,
        //   width: 800,
        // }}
        // onAdd={onAdd}
        // onDelete={onDelete}
        // onEdit={onEdit}
        // useGetDetail={useGetPermission}
        // loading={isUpdatingStatus || isDeleting}
        // filter={filter}
        disableAction={true}
        isAdd={false}
      />
      <FormRole ref={ref} />
      {contextHolder}
    </div>
  );
};

export default Roles;
