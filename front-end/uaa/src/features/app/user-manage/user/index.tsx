import ViewModal from "./components/ViewModal";
import { useGetUsers } from "./services/query";
import FullTable from "@/components/FullTable";
import { toVietnamTime } from "@shared/render/time";
import { Dropdown, Switch, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EllipsisVertical, Eye } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

const Users = () => {
  const { t } = useTranslation();
  const [header, setHeader] = useState<{
    open: boolean;
    id: string | null;
    type: "VIEW" | "EDIT" | null;
  }>({
    open: false,
    id: null,
    type: null,
  });
  const columns: ColumnsType<IUserService.UsersDTO> = [
    {
      title: t("users.username"),
      dataIndex: "username",
      key: "username",
    },
    {
      title: t("users.fullName"),
      dataIndex: ["userId", "fullName"],
      key: "fullName",
    },
    {
      title: t("users.phone"),
      dataIndex: ["userId", "phone"],
      key: "phone",
    },
    {
      title: t("users.active"),
      dataIndex: ["userId", "isActive"],
      key: "active",
      render: (value) => {
        return <Switch value={value} />;
      },
    },
    {
      title: t("users.role"),
      dataIndex: ["roleId", "name"],
      key: "roleName",
      render: (value) => {
        return <Tag variant="outlined">{value}</Tag>;
      },
    },
    {
      title: t("users.createdAt"),
      dataIndex: ["createdAt"],
      key: "createdAt",
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
              //   {
              //     key: "edit",
              //     label: t("button.edit"),
              //     icon: <Pencil className="h-4 w-4" />,
              //     onClick: () => handleEdit(record),
              //   },
              //   { type: "divider" as const },
              //   {
              //     key: "delete",
              //     label: t("button.delete"),
              //     icon: <Trash className="h-4 w-4" />,
              //     danger: true,
              //     disabled: record.isSystem,
              //     onClick: () => handleDelete(record.id),
              //   },
            ],
          }}
        >
          <EllipsisVertical className="cursor-pointer" />
        </Dropdown>
      ),
    },
  ];

  const handleView = (data: IUserService.UsersDTO) => {
    setHeader({
      open: true,
      id: data.id,
      type: "VIEW",
    });
  };

  const handleClose = useCallback(() => {
    setHeader({
      open: false,
      id: null,
      type: null,
    });
  }, []);

  return (
    <div>
      <FullTable<IUserService.UsersDTO>
        columns={columns}
        useGetList={useGetUsers}
        disableAction
        isExport={false}
        isAdd={false}
      />
      <ViewModal onCancel={handleClose} header={header} />
    </div>
  );
};

export default Users;
