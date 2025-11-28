import { useGetPermissions } from "./services/query";
import PermissionService from "./services/service";
import ProTable from "@/components/ProTable";
import { Chip } from "@heroui/chip";
import type { IParamsPagination } from "@shared/types/service";
import { toUpper } from "lodash";
import { useMemo, useState } from "react";

const Permissions = () => {
  const [pagination, setPagination] = useState<IParamsPagination>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading } = useGetPermissions({
    page: pagination.page,
    limit: pagination.limit,
    sortField: pagination.sortField,
    sortOrder: pagination.sortOrder,
    query: pagination.query,
  });

  const renderRow = useMemo(() => {
    return (item: any, key: string) => {
      switch (key) {
        case "resource":
          return item[key].name;
        case "operation":
          return (
            <Chip
              color={
                PermissionService.operationConfig[
                  item[key]?.toLowerCase() as keyof typeof PermissionService.operationConfig
                ]?.color || "default"
              }
            >
              <span className="flex items-center gap-1">{toUpper(item[key])}</span>
            </Chip>
          );
        case "isActive":
          return item[key] ? (
            <Chip color="success">Active</Chip>
          ) : (
            <Chip color="danger">Inactive</Chip>
          );
        default:
          return item[key];
      }
    };
  }, []);

  return (
    <>
      <ProTable
        data={data?.data.results || []}
        pagination={pagination}
        isLoading={isLoading}
        columns={PermissionService.columns}
        renderRow={renderRow}
        total={{
          page: data?.data.totalPages || 0,
          records: data?.data.totalResults || 0,
        }}
        setPagination={setPagination}
      />
    </>
  );
};

export default Permissions;
