import FormPermission from "./components/FormPermission";
import { OPERATION } from "./const";
import { useDeletePermission } from "./services/mutation";
import { useGetPermissions } from "./services/query";
import ProTable from "@/components/ProTable";
import { renderConstant } from "@shared/render/const";
import { toVietnamTime } from "@shared/render/time";
import type { IParamsPagination, IResp } from "@shared/types/service";
import { Checkbox } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useState } from "react";

const Permissions = () => {
  const [pagination, setPagination] = useState<IParamsPagination>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading, isFetching, refetch } = useGetPermissions({
    page: pagination.page,
    limit: pagination.limit,
    sortField: pagination.sortField,
    sortOrder: pagination.sortOrder,
    query: pagination.query,
  });
  const { mutateAsync: deletePermission } = useDeletePermission();

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
      render: (value) => renderConstant(value, OPERATION),
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

  const onChangePage = useCallback(
    (paginationAntd: TablePaginationConfig) => {
      paginationAntd.current = paginationAntd?.current || 1;
      paginationAntd.pageSize = paginationAntd?.pageSize || 10;
      setPagination({
        ...pagination,
        total: data?.data.totalResults || pagination.total, // xét cái này để pagination không bị giật, vì khi đổi page, totalResults có thể không có
        page: paginationAntd?.current || pagination.page,
        limit: paginationAntd?.pageSize || pagination.limit,
      });
    },
    [pagination, data?.data.totalResults],
  );

  const onDelete = (id: string): Promise<IResp<void>> => {
    return deletePermission(id.toString(), {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const onAdd = (values: IResourceService.CreateResourceDTO): Promise<any> => {
    console.log("values", values);
    // return createResource(values, {
    //   onSuccess: () => {
    //     refetch();
    //   },
    // });
    return Promise.resolve();
  };

  return (
    <>
      <ProTable<IPermissionService.PermissionDTO>
        key={"permissions-table"}
        columns={columns}
        dataSource={data?.data.results || []}
        isExport={false}
        loading={isLoading || isFetching}
        pagination={{
          total: data?.data.totalResults || pagination.total,
          current: data?.data.page || pagination.page,
          pageSize: data?.data.limit || pagination.limit,
          onChange: (page, pageSize) => {
            onChangePage({
              current: page,
              pageSize,
            });
          },
        }}
        onDelete={onDelete}
        onAdd={onAdd}
        form={{
          children: <FormPermission />,
          title: "Permission",
          initialValues: {
            name: "",
            path: "",
          },
          //   buttonLoading: isCreating || isUpdating,
        }}
      />
    </>
  );
};

export default Permissions;
