import { useUpdatePermissionStatus } from "./services/mutation";
import { useGetPermissions } from "./services/query";
import PermissionService from "./services/service";
import FullTable from "@/components/FullTable";
import { renderConstant } from "@shared/render/const";
import { toVietnamTime } from "@shared/render/time";
import { Checkbox } from "antd";
import type { ItemType } from "antd/es/menu/interface";
import type { ColumnsType } from "antd/es/table";
import { Ban, CircleCheckBig } from "lucide-react";

const Permissions = () => {
  // const [pagination, setPagination] = useState<IParamsPagination>({
  //   page: 1,
  //   limit: 10,
  // });
  // const { mutateAsync: deletePermission } = useDeletePermission();
  // const { mutateAsync: createPermission, isPending: isCreating } = useCreatePermission();
  // const { mutateAsync: updatePermission, isPending: isUpdating } = useUpdatePermission();
  const { mutateAsync: updatePermissionStatus, isPending: isUpdatingStatus } =
    useUpdatePermissionStatus();

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
      render: (value) => renderConstant(value, PermissionService.OPERATION),
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

  // const onChangePage = useCallback(
  //   (paginationAntd: TablePaginationConfig) => {
  //     paginationAntd.current = paginationAntd?.current || 1;
  //     paginationAntd.pageSize = paginationAntd?.pageSize || 10;
  //     setPagination({
  //       ...pagination,
  //       total: data?.data.totalResults || pagination.total, // xét cái này để pagination không bị giật, vì khi đổi page, totalResults có thể không có
  //       page: paginationAntd?.current || pagination.page,
  //       limit: paginationAntd?.pageSize || pagination.limit,
  //     });
  //   },
  //   [pagination, data?.data.totalResults],
  // );

  // const onDelete = (id: string): Promise<IResp<void>> => {
  //   return deletePermission(id.toString(), {
  //     onSuccess: () => {
  //       refetch();
  //     },
  //   });
  // };

  // const onAdd = (values: IPermissionService.CreatePermissionDTO): Promise<any> => {
  //   return createPermission(values, {
  //     onSuccess: () => {
  //       refetch();
  //     },
  //   });
  // };

  // const onEdit = (values: IPermissionService.UpdatePermissionDTO): Promise<any> => {
  //   return updatePermission(values, {
  //     onSuccess: () => {
  //       refetch();
  //     },
  //   });
  // };

  const onUpdateStatus = (values: IPermissionService.UpdatePermissionStatusDTO): Promise<any> => {
    return updatePermissionStatus(values);
  };

  const extraButton = (record: IPermissionService.PermissionDTO): ItemType[] => [
    {
      key: "changeStatus",
      label: record.isActive ? "Inactivate" : "Activate",
      icon: record.isActive ? <Ban className="h-4 w-4" /> : <CircleCheckBig className="h-4 w-4" />,
      onClick: () =>
        onUpdateStatus({
          id: record.id,
          isActive: !record.isActive,
        }),
    },
  ];

  return (
    <>
      <FullTable<IPermissionService.PermissionDTO>
        key={"permissions-table"}
        columns={columns}
        isExport={false}
        useGetList={useGetPermissions}
        extraAction={extraButton}
      />
    </>
  );
};

export default Permissions;
