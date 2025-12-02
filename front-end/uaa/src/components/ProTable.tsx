import ModalForm from "./ModalForm";
import MessageService from "@shared/message";
import type { IResp } from "@shared/types/service";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  Pagination,
  Table,
  type InputRef,
  type PaginationProps,
} from "antd";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import type { ItemType } from "antd/es/menu/interface";
import type { ColumnsType } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { EllipsisVertical, Eye, FileDown, Pencil, Plus, Trash } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState, type JSX, type ReactNode } from "react";

interface IProTableProps<T extends { id: string | number }> {
  titleTable?: string;
  bordered?: boolean;
  columns: ColumnsType<T>;
  dataSource: T[];
  loading?: boolean;
  isAdd?: boolean;
  onAdd?: (values: any) => Promise<any> | void;
  isEdit?: boolean;
  onEdit?: (record: T) => Promise<any> | void;
  isDelete?: boolean;
  onDelete?: (id: T["id"]) => Promise<any>;
  isView?: boolean;
  isExport?: boolean;
  onExport?: () => void;
  pagination?: PaginationProps;
  form?: {
    title?: string;
    children?: ReactNode;
    initialValues?: Record<string, any>;
    handleInitialValues?: (values: Record<string, any> | null) => Record<string, any>;
    onCancel?: () => void;
    submitButtonText?: string;
    buttonLoading?: boolean;
  };
  onReload?: () => void;
  onSort?: (sorter: SorterResult<T>) => void;
  useGetDetail?: (id: T["id"]) => UseQueryResult<IResp<T>, Error>;
  size?: SizeType;
  extraAction?: (record: T) => ItemType[];
  extraButtonTop?: ReactNode;
  filter?: ReactNode;
  search?: {
    placeholder?: string;
    name?: string;
  };
  onSearch?: (values: { search: string }) => void;
}

const ProTable = <T extends { id: string | number }>({
  bordered = false,
  columns,
  dataSource,
  loading,
  isAdd = true,
  onAdd,
  isEdit = true,
  onEdit,
  isDelete = true,
  onDelete,
  isView = true,
  isExport = true,
  onExport,
  pagination,
  form,
  onReload,
  onSort,
  size,
  useGetDetail,
  extraAction,
  extraButtonTop,
  filter,
  search,
  onSearch,
}: IProTableProps<T>): JSX.Element => {
  const [modal, contextHolder] = Modal.useModal();
  const [formInstance] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<T | null>(null);
  const [formMode, setFormMode] = useState<"ADD" | "EDIT" | "VIEW" | undefined>();
  const { data, isLoading, refetch } = useGetDetail?.(currentRecord?.id as T["id"]) || {};
  const searchRef = useRef<InputRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSetFormValues = useCallback(
    (data: T) => {
      setCurrentRecord(data);
      const initialValues = form?.handleInitialValues?.(data) || data;
      formInstance.setFieldsValue(initialValues);
    },
    [formInstance, form],
  );

  useEffect(() => {
    if (!isModalOpen || isSubmitting) return;
    if (data?.data) {
      if (!formInstance.isFieldsTouched(true)) {
        handleSetFormValues(data.data);
      }
    }
  }, [isModalOpen, isSubmitting, data?.data, handleSetFormValues, formInstance]);

  useEffect(() => {
    if (isModalOpen && currentRecord?.id && typeof refetch === "function") {
      refetch();
    }
  }, [isModalOpen, currentRecord?.id, refetch]);

  const columnWithSttAndAction = () => {
    return [
      {
        title: "STT",
        dataIndex: "stt",
        key: "stt",
        width: 60,
        render: (_: T, __: any, index: number) =>
          index +
          1 +
          (pagination?.current && pagination?.pageSize
            ? (pagination?.current - 1) * pagination?.pageSize
            : 0),
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
                  ...(extraAction?.(record) || []),
                  ...(isView
                    ? [
                        {
                          key: "view",
                          label: "View",
                          icon: <Eye className="h-4 w-4" />,
                          onClick: () => handleView(record),
                        },
                      ]
                    : []),
                  ...(isEdit
                    ? [
                        {
                          key: "edit",
                          label: "Edit",
                          icon: <Pencil className="h-4 w-4" />,
                          onClick: () => handleEdit(record),
                        },
                      ]
                    : []),
                  ...(isDelete ? [{ type: "divider" as const }] : []),
                  ...(isDelete
                    ? [
                        {
                          key: "delete",
                          label: "Delete",
                          icon: <Trash className="h-4 w-4" />,
                          danger: true,
                          onClick: () => handleDelete(record.id),
                        },
                      ]
                    : []),
                ],
              }}
            >
              <EllipsisVertical className="cursor-pointer" />
            </Dropdown>
          );
        },
      },
    ];
  };

  const handleEdit = (record: T) => {
    setCurrentRecord(record);
    setFormMode("EDIT");
    setIsModalOpen(true);
  };

  const handleView = (record: T) => {
    setCurrentRecord(record);
    setFormMode("VIEW");
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentRecord(null);
    setFormMode("ADD");
    if (form?.initialValues) {
      formInstance.setFieldsValue(form.initialValues);
    } else {
      formInstance.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSearch = () => {
    if (searchRef.current) {
      if (onSearch) {
        onSearch({ search: searchRef.current?.input?.value || "" });
      }
    }
  };

  const handleDelete = (id: T["id"]) => {
    modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this record?",
      okText: "Delete",
      okType: "danger",
      onOk: () => {
        if (onDelete) {
          return onDelete(id).then(() => {});
        } else {
          MessageService.error("onDelete is not defined");
        }
      },
    });
  };

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
    setCurrentRecord(null);
    setFormMode(undefined);
    form?.onCancel?.();
  }, [form]);

  const handleSubmit = () => {
    formInstance.validateFields().then(async (values) => {
      try {
        setIsSubmitting(true);
        if (formMode === "ADD" && onAdd) {
          const result = onAdd(values);
          if (result && typeof (result as any).then === "function") {
            await result;
          }
          handleClose();
          if (onReload) {
            onReload();
          }
        } else if (formMode === "EDIT" && onEdit) {
          const result = onEdit({ ...currentRecord, ...values });
          if (result && typeof (result as any).then === "function") {
            await result;
          }
          handleClose();
          if (onReload) {
            onReload();
          }
        } else {
          MessageService.error(`${formMode === "ADD" ? "onAdd" : "onEdit"} is not defined`);
        }
      } catch (error: any) {
        MessageService.error(error?.message || "Submit failed");
      } finally {
        setIsSubmitting(false);
      }
    });
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <div>
          {search && (
            <Input
              placeholder={search?.placeholder || "Search"}
              name={search?.name || "search"}
              ref={searchRef}
              onPressEnter={handleSearch}
            />
          )}
        </div>
        <div className="flex gap-2">
          {filter}
          {extraButtonTop}
          {isExport && (
            <Button
              type="primary"
              ghost
              key="toolbarExportButton"
              icon={<FileDown />}
              onClick={onExport}
            >
              Export
            </Button>
          )}
          {isAdd && (
            <Button type="primary" icon={<Plus />} onClick={handleAdd}>
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
        scroll={{
          x: 1000,
        }}
        onChange={(_, __, sorter) => {
          if (onSort) {
            onSort(sorter as SorterResult<T>);
          }
        }}
        bordered={bordered}
        size={size}
      />
      {pagination && (
        <div className="flex justify-between">
          <div>Total {pagination.total} records</div>
          <Pagination {...pagination} />
          <div></div>
        </div>
      )}
      {contextHolder}
      <ModalForm
        loading={isLoading}
        isOpen={isModalOpen}
        onCancel={handleClose}
        form={formInstance}
        onOk={handleSubmit}
        initialValues={formMode === "ADD" ? form?.initialValues || {} : data?.data || {}}
        title={
          formMode === "ADD"
            ? `Add New ${form?.title || "Record"}`
            : formMode === "VIEW"
              ? `View ${form?.title || "Record"}`
              : `Edit ${form?.title || "Record"}`
        }
        submitButtonText={form?.submitButtonText || (formMode === "ADD" ? "Add" : "Update")}
        okButtonProps={{
          type: "primary",
          hidden: formMode === "VIEW",
          loading: form?.buttonLoading || false,
        }}
        cancelText={formMode === "VIEW" ? "Close" : "Cancel"}
      >
        {form?.children ? form.children : null}
      </ModalForm>
    </div>
  );
};

export default memo(ProTable) as <T extends { id: string | number }>(
  props: IProTableProps<T>,
) => React.JSX.Element;
