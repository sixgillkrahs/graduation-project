import FormResource from "./components/FormResource";
import { useCreateResource, useDeleteResource, useUpdateResource } from "./services/mutation";
import { useGetResource, useGetResources } from "./services/query";
import ProTable from "@/components/ProTable";
import { toVietnamTime } from "@shared/render/time";
import type { IParamsPagination, IResp } from "@shared/types/service";
import type { ColumnsType } from "antd/es/table";
import type { SorterResult, TablePaginationConfig } from "antd/es/table/interface";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

const Resources = () => {
  const { t } = useTranslation();
  const { mutateAsync: deleteResource } = useDeleteResource();
  const { mutateAsync: createResource, isPending: isCreating } = useCreateResource();
  const { mutateAsync: updateResource, isPending: isUpdating } = useUpdateResource();
  const [pagination, setPagination] = useState<IParamsPagination>({
    page: 1,
    limit: 10,
    sortField: "createdAt",
    sortOrder: "asc",
    total: 0,
  });
  console.log(t);
  const { data, isLoading, isFetching, refetch } = useGetResources({
    page: pagination.page,
    limit: pagination.limit,
    sortField: pagination.sortField,
    sortOrder: pagination.sortOrder,
    query: pagination.query,
  });

  const columns: ColumnsType<IResourceService.ResourceDTO> = [
    {
      title: t("resource.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("resource.path"),
      dataIndex: "path",
      key: "path",
      render: (value) => <>/{value || "-"}</>,
    },
    {
      title: t("resource.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => toVietnamTime(value),
      sorter: true,
      width: 230,
    },
    {
      title: t("resource.updatedAt"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value) => toVietnamTime(value),
      sorter: true,
      width: 230,
    },
  ];

  const onAdd = (values: IResourceService.CreateResourceDTO): Promise<any> => {
    return createResource(values, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const onEdit = (values: IResourceService.UpdateResourceDTO): Promise<any> => {
    return updateResource(values, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const onDelete = (id: string): Promise<IResp<void>> => {
    return deleteResource(id.toString(), {
      onSuccess: () => {
        refetch();
      },
    });
  };

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

  const onChangeSort = useCallback(
    (sorter: SorterResult<IResourceService.ResourceDTO>) => {
      setPagination({
        ...pagination,
        sortField: sorter?.field || pagination.sortField,
        sortOrder: sorter?.order === "ascend" ? "asc" : sorter?.order || pagination.sortOrder,
      });
    },
    [pagination],
  );

  const onSearch = (values: { search: string }) => {
    setPagination({
      ...pagination,
      page: 1,
      total: data?.data.totalResults || pagination.total,
      query: values.search,
    });
  };

  return (
    <>
      <ProTable<IResourceService.ResourceDTO>
        titleTable="Danh sách tài nguyên"
        columns={columns}
        dataSource={data?.data.results || []}
        loading={isLoading || isFetching}
        onDelete={onDelete}
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
        onSort={onChangeSort}
        onAdd={onAdd}
        onEdit={onEdit}
        form={{
          title: t("resource.title"),
          children: <FormResource />,
          initialValues: {
            name: "",
            path: "",
          },
          buttonLoading: isCreating || isUpdating,
        }}
        key={"resource-form"}
        useGetDetail={useGetResource}
        search={{
          placeholder: t("resource.placeholder"),
          name: "search",
        }}
        onSearch={onSearch}
      />
      <h1>{t("welcome")}</h1>
    </>
  );
};

export default Resources;
