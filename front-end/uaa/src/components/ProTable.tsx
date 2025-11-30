import ModalCU from "./Modal";
import MessageService from "@shared/message";
import {
  Button,
  Dropdown,
  Form,
  Modal,
  Pagination,
  Table,
  type FormInstance,
  type PaginationProps,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { EllipsisVertical, Eye, FileDown, Pencil, Plus, Trash } from "lucide-react";
import { memo, useCallback, useState, type JSX, type ReactNode } from "react";

interface IProTableProps<T extends { id: string | number }> {
  columns: ColumnsType<T>;
  dataSource: T[];
  loading?: boolean;
  isAdd?: boolean;
  onAdd?: (values: any) => void;
  isDelete?: boolean;
  onDelete?: (id: T["id"]) => void;
  pagination?: PaginationProps;
  form?: {
    title?: string;
    children?: (props: { form: FormInstance }) => JSX.Element;
  };
  onReload?: () => void;
}

const ProTable = <T extends { id: string | number }>({
  columns,
  dataSource,
  loading,
  isAdd = true,
  onAdd,
  isDelete = true,
  onDelete,
  pagination,
  form,
  onReload,
}: IProTableProps<T>): JSX.Element => {
  const [modal, contextHolder] = Modal.useModal();
  const [formInstance] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const columnWithSttAndAction = () => {
    return [
      {
        title: "STT",
        dataIndex: "stt",
        key: "stt",
        width: 60,
        render: (_: T, __: any, index: number) => index + 1,
      },
      ...columns,
      {
        title: "Action",
        dataIndex: "action",
        key: "action",
        width: 100,
        render: (_: any, record: T) => {
          return (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "view",
                    label: "View",
                    icon: <Eye className="h-4 w-4" />,
                  },
                  {
                    key: "edit",
                    label: "Edit",
                    icon: <Pencil className="h-4 w-4" />,
                  },
                  ...(isDelete ? [{ type: "divider" as const }] : []),
                  ...(isDelete
                    ? [
                        {
                          key: "delete",
                          label: "Delete",
                          icon: <Trash className="h-4 w-4" />,
                          danger: true,
                          onClick: () => {
                            modal.confirm({
                              title: "Confirm Delete",
                              content: "Are you sure you want to delete this record?",
                              okText: "Delete",
                              okType: "danger",
                              onOk: () => {
                                if (onDelete) {
                                  onDelete(record.id);
                                } else {
                                  MessageService.error("onDelete is not defined");
                                }
                              },
                            });
                          },
                        },
                      ]
                    : []),
                ],
              }}
            >
              <EllipsisVertical />
            </Dropdown>
          );
        },
      },
    ];
  };

  const handleOpen = () => setIsModalOpen(true);

  const handleClose = useCallback(() => setIsModalOpen(false), []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <div></div>
        <div className="flex gap-2">
          <Button color="cyan" icon={<FileDown />}>
            Export
          </Button>
          {isAdd && (
            <Button type="primary" icon={<Plus />} onClick={handleOpen}>
              Add New
            </Button>
          )}
        </div>
      </div>
      <Table
        columns={columnWithSttAndAction()}
        dataSource={dataSource}
        loading={loading}
        key={"pro-table"}
        className="h-[500px] overflow-auto"
        rowKey={(record) => record.id}
        pagination={false}
      />
      {pagination && (
        <div className="flex justify-between">
          <div>Total {pagination.total} records</div>
          <Pagination {...pagination} />
          <div></div>
        </div>
      )}
      {contextHolder}
      <ModalCU
        isOpen={isModalOpen}
        onCancel={() => {
          handleClose();
          formInstance.resetFields();
        }}
        onOk={() => {
          formInstance.validateFields().then((values) => {
            if (onAdd) {
              onAdd(values);
              handleClose();
              formInstance.resetFields();
              if (onReload) {
                onReload();
              }
            } else {
              MessageService.error("onAdd is not defined");
            }
          });
        }}
        title={form?.title || "Add New"}
      >
        {form?.children ? form.children({ form: formInstance }) : null}
      </ModalCU>
    </div>
  );
};

export default memo(ProTable) as <T extends { id: string | number }>(
  props: IProTableProps<T>,
) => React.JSX.Element;
