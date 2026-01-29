import ModalForm from "./ModalForm";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { buildDateRange, cleanEmpty } from "@shared/helper";
import MessageService from "@shared/message";
import type { IPaginationResp, IParamsPagination, IResp } from "@shared/types/service";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  Table,
  type InputRef,
} from "antd";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import type { ItemType } from "antd/es/menu/interface";
import type { ColumnsType } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { EllipsisVertical, FileDown, Plus } from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";

const { RangePicker } = DatePicker;

type Path<T> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ? T[K] extends object
          ? [K] | [K, ...Path<T[K]>]
          : [K]
        : never;
    }[keyof T]
  : never;

type FilterName<T> = keyof T | Path<T>;

export interface IFilter<T extends { id: string | number }> {
  name: FilterName<T>;
  type: "input" | "select" | "date";
  options?: {
    label: string;
    value: string | number | boolean;
  }[];
  placeholder?: string;
}

interface IProTableProps<T extends { id: string | number }> {
  titleTable?: string;
  bordered?: boolean;
  columns: ColumnsType<T>;
  loading?: boolean;
  isAdd?: boolean;
  onAdd?: (values: any) => Promise<any> | void;
  isEdit?: boolean;
  onEdit?: (record: T) => Promise<any> | void;
  isDelete?: boolean;
  onDelete?: (id: T["id"]) => Promise<any>;
  isView?: boolean; // show view button
  isDetail?: boolean; // change path to /:id
  onDetail?: (record: T) => void;
  isExport?: boolean;
  onExport?: () => void;
  disableAction?: boolean;
  form?: {
    title?: string;
    children?: ReactNode;
    initialValues?: Record<string, any>;
    handleInitialValues?: (values: Record<string, any> | null) => Record<string, any>;
    onCancel?: () => void;
    submitButtonText?: string;
    buttonLoading?: boolean;
    width?: number;
  };
  onReload?: () => void;
  useGetDetail?: (id: T["id"]) => UseQueryResult<IResp<T>, Error>;
  useGetList?: (params: IParamsPagination) => UseQueryResult<IPaginationResp<T>, Error>;
  size?: SizeType;
  extraAction?: (record: T) => ItemType[];
  extraButtonTop?: ReactNode;
  filter?: IFilter<T>[];
  search?: {
    placeholder?: string;
    name?: string;
    onSearch?: (values: { search: string }) => void;
  };
}

const FullTable = <T extends { id: string | number }>({
  bordered = false,
  columns,
  isAdd = true,
  onAdd,
  isEdit = true,
  onEdit,
  isDelete = true,
  onDelete,
  isView = true,
  isDetail = false,
  onDetail,
  isExport = true,
  onExport,
  form,
  onReload,
  size,
  useGetDetail,
  extraAction,
  extraButtonTop,
  filter,
  search,
  useGetList,
  loading,
  disableAction = false,
}: IProTableProps<T>): JSX.Element => {
  const { t } = useTranslation();
  const [modal, contextHolder] = Modal.useModal();
  const [formInstance] = Form.useForm();
  const [formFilter] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<T | null>(null);
  const [formMode, setFormMode] = useState<"ADD" | "EDIT" | "VIEW" | undefined>();
  const { data, isLoading, refetch } = useGetDetail?.(currentRecord?.id as T["id"]) || {};
  const searchRef = useRef<InputRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState<IParamsPagination>({
    page: 1,
    limit: 10,
    total: 0,
  });
  const {
    data: listData,
    isLoading: listLoading,
    refetch: refetchList,
  } = useGetList?.({
    page: pagination.page,
    limit: pagination.limit,
    query: searchRef.current?.input?.value,
    sortField: pagination.sortField,
    sortOrder: pagination.sortOrder,
  }) || {};

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

  const handleEdit = useCallback((record: T) => {
    setCurrentRecord(record);
    setFormMode("EDIT");
    setIsModalOpen(true);
  }, []);

  const handleView = useCallback(
    (record: T) => {
      if (isView && !isDetail) {
        setCurrentRecord(record);
        setFormMode("VIEW");
        setIsModalOpen(true);
      } else if (isDetail) {
        onDetail?.(record);
      }
    },
    [isDetail, isView, onDetail],
  );

  const handleAdd = useCallback(() => {
    setCurrentRecord(null);
    setFormMode("ADD");
    if (form?.initialValues) {
      formInstance.setFieldsValue(form.initialValues);
    } else {
      formInstance.resetFields();
    }
    setIsModalOpen(true);
  }, [form, formInstance]);

  const handleSearch = useCallback(() => {
    if (searchRef.current) {
      setPagination({
        ...pagination,
        page: 1,
        limit: 10,
        query: searchRef.current?.input?.value,
      });
    }
  }, [pagination]);

  const toDotPath = (name: FilterName<any>) =>
    Array.isArray(name) ? name.join(".") : String(name);

  const handleFilterChange = () => {
    const rawValues = formFilter.getFieldsValue();
    const cleanedValues = cleanEmpty(rawValues);

    const formattedFilters: Record<string, any> = {};
    filter?.forEach((item) => {
      const key = getLastKey(item.name);
      const value = cleanedValues[key];

      if (value === undefined) return;

      const apiKey = toDotPath(item.name);

      if (item.type === "date") {
        const range = buildDateRange(value);
        if (range) {
          formattedFilters[apiKey] = range;
        }
      } else {
        formattedFilters[apiKey] = value;
      }
    });

    setPagination({
      page: 1,
      limit: 10,
      ...formattedFilters,
    });
  };

  const handleDelete = useCallback(
    (id: T["id"]) => {
      modal.confirm({
        title: t("confirm.delete.title"),
        content: t("confirm.delete.content"),
        okText: t("button.delete"),
        okType: "danger",
        onOk: () => {
          if (onDelete) {
            return onDelete(id);
          } else {
            MessageService.error("onDelete is not defined");
          }
        },
        cancelText: t("button.cancel"),
      });
    },
    [modal, onDelete, t],
  );

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
    setCurrentRecord(null);
    setFormMode(undefined);
    form?.onCancel?.();
  }, [form]);

  const columnWithSttAndAction = useMemo(() => {
    return [
      {
        title: t("columns.stt"),
        dataIndex: "stt",
        key: "stt",
        width: 60,
        render: (_: T, __: any, index: number) =>
          index + 1 + ((listData?.data.page || 1) - 1) * (listData?.data.limit || 10),
      },

      ...columns,

      ...(disableAction
        ? []
        : [
            {
              title: t("columns.action"),
              dataIndex: "action",
              key: "action",
              width: 120,
              render: (_: any, record: T) => (
                <Dropdown
                  menu={{
                    items: [
                      ...(extraAction?.(record) || []),

                      ...(isView || isDetail
                        ? [
                            {
                              key: "view",
                              label: t("button.view"),
                              icon: <EyeOutlined />,
                              onClick: () => handleView(record),
                            },
                          ]
                        : []),

                      ...(isEdit
                        ? [
                            {
                              key: "edit",
                              label: t("button.edit"),
                              icon: <EditOutlined />,
                              onClick: () => handleEdit(record),
                            },
                          ]
                        : []),

                      ...(isDelete ? [{ type: "divider" as const }] : []),

                      ...(isDelete
                        ? [
                            {
                              key: "delete",
                              label: t("button.delete"),
                              icon: <DeleteOutlined />,
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
              ),
            },
          ]),
    ];
  }, [
    disableAction,
    columns,
    listData?.data.page,
    listData?.data.limit,
    isView,
    isEdit,
    isDelete,
    isDetail,
    extraAction,
    handleDelete,
    handleEdit,
    handleView,
    t,
  ]);

  const getLastKey = (name: FilterName<T>): string => {
    if (Array.isArray(name)) {
      return String(name[name.length - 1]);
    }
    return String(name);
  };

  const handleSubmit = useCallback(() => {
    formInstance.validateFields().then(async (values: any) => {
      try {
        setIsSubmitting(true);
        if (formMode === "ADD" && onAdd) {
          const result = onAdd(values);
          if (result && typeof (result as any).then === "function") {
            await result;
          }
          handleClose();
          await refetchList?.();
          if (onReload) {
            onReload();
          }
        } else if (formMode === "EDIT" && onEdit) {
          const result = onEdit({ ...currentRecord, ...values });
          if (result && typeof (result as any).then === "function") {
            await result;
          }
          handleClose();
          refetchList?.();
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
  }, [formInstance, formMode, onAdd, onEdit, currentRecord, handleClose, onReload, refetchList]);

  const onSort = (sorter: SorterResult<T>) => {
    setPagination({
      ...pagination,
      sortBy: sorter.field,
      sortOrder: sorter.order === "ascend" ? "asc" : "desc",
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
          <div>
            {filter && (
              <Form form={formFilter}>
                <div className="flex gap-2">
                  {filter.map((item) => {
                    const fieldName = getLastKey(item.name);
                    if (item.type === "input") {
                      return (
                        <Form.Item key={fieldName} name={fieldName} className="mb-0!">
                          <Input
                            placeholder={item.placeholder || `Search ${fieldName}`}
                            allowClear
                            onPressEnter={handleFilterChange}
                            onClear={handleFilterChange}
                          />
                        </Form.Item>
                      );
                    }
                    if (item.type === "select") {
                      return (
                        <Form.Item key={fieldName} name={fieldName} className="mb-0!">
                          <Select
                            placeholder={item.placeholder || `Search ${fieldName}`}
                            options={item.options}
                            className="w-full min-w-[180px]"
                            allowClear
                            onChange={handleFilterChange}
                          />
                        </Form.Item>
                      );
                    }
                    return (
                      <Form.Item key={fieldName} name={fieldName} className="mb-0!">
                        <RangePicker
                          className="w-full min-w-[260px]"
                          placeholder={["From date", "To date"]}
                          allowClear
                          onChange={handleFilterChange}
                        />
                      </Form.Item>
                    );
                  })}
                </div>
              </Form>
            )}
          </div>
          {extraButtonTop}
          {isExport && (
            <Button
              type="primary"
              ghost
              key="toolbarExportButton"
              icon={<FileDown />}
              onClick={onExport}
            >
              {t("button.export")}
            </Button>
          )}
          {isAdd && (
            <Button type="primary" icon={<Plus />} onClick={handleAdd}>
              {t("button.add")}
            </Button>
          )}
        </div>
      </div>
      <Table
        columns={columnWithSttAndAction}
        dataSource={useMemo(() => listData?.data.results || [], [listData?.data.results])}
        loading={listLoading || loading}
        key={"pro-table"}
        className="h-[500px] overflow-auto"
        rowKey={(record) => record.id}
        pagination={false}
        scroll={{
          x: 1000,
        }}
        onChange={(_, __, sorter) => {
          onSort(sorter as SorterResult<T>);
        }}
        bordered={bordered}
        size={size}
      />
      {pagination && (
        <div className="flex justify-between">
          <div>
            {t("pagination.totalRecords")}: {listData?.data.totalResults || pagination.total || 0}{" "}
            {t("pagination.records")}
          </div>
          <Pagination
            total={listData?.data.totalResults || pagination.total || 0}
            current={listData?.data.page || pagination.page}
            pageSize={listData?.data.limit || pagination.limit}
            onChange={(page, pageSize) => {
              setPagination((prev) => ({
                ...prev,
                total: listData?.data.totalResults || prev.total,
                page: page,
                limit: pageSize,
              }));
            }}
          />
          <div></div>
        </div>
      )}
      {contextHolder}
      <ModalForm
        width={form?.width}
        loading={isLoading}
        isOpen={isModalOpen}
        onCancel={handleClose}
        form={formInstance}
        onOk={handleSubmit}
        initialValues={formMode === "ADD" ? form?.initialValues || {} : data?.data || {}}
        title={
          formMode === "ADD"
            ? `${t("button.add")} ${form?.title || "Record"}`
            : formMode === "VIEW"
              ? `${t("button.view")} ${form?.title || "Record"}`
              : `${t("button.edit")} ${form?.title || "Record"}`
        }
        submitButtonText={
          form?.submitButtonText || (formMode === "ADD" ? t("button.add") : t("button.update"))
        }
        okButtonProps={{
          type: "primary",
          hidden: formMode === "VIEW",
          loading: form?.buttonLoading || false,
        }}
        cancelText={formMode === "VIEW" ? t("button.close") : t("button.cancel")}
      >
        {form?.children ? form.children : null}
      </ModalForm>
    </div>
  );
};

export default memo(FullTable) as <T extends { id: string | number }>(
  props: IProTableProps<T>,
) => React.JSX.Element;
