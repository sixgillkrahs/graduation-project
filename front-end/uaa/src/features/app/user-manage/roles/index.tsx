import FormRole, { type FormRef } from "./components/FormRole";
import { useCreateRole } from "./services/mutate";
import { useGetRoles } from "./services/query";
import FullTable from "@/components/FullTable";
import { toVietnamTime } from "@shared/render/time";
import { Button, Checkbox, Dropdown, Flex } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EllipsisVertical, Eye, Pencil, PlusIcon, Trash } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const Roles = () => {
  const { t } = useTranslation();
  const ref = useRef<FormRef>(null);
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
      sorter: true,
      render: (value) => toVietnamTime(value),
    },
    {
      title: t("columns.action"),
      dataIndex: "action",
      key: "action",
      width: 120,
      render: (value, record) => (
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
                // onClick: () => handleDelete(record.id),
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
    // console.log(first)
    ref.current?.open();
  };

  function handleView(record: IRoleService.RoleDTO) {}

  // const onAdd = useCallback(
  //   (values: IRoleService.CreateRoleDTO): Promise<any> => {
  //     return createRole(values);
  //   },
  //   [createRole],
  // );

  return (
    <div>
      <Flex justify="flex-end">
        <Button
          type="primary"
          htmlType="submit"
          loading={isCreating}
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
      {/* {state.open && ( */}
      <FormRole
        // onOk={() => dispatch({ type: "close" })}
        ref={ref}
      />
      {/* )} */}
    </div>
  );
};

export default Roles;
