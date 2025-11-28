import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Pagination } from "@heroui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  type SortDescriptor,
} from "@heroui/table";
import type { IColumn, IParamsPagination } from "@shared/types/service";
import { EllipsisVertical, FileDown, PlusIcon } from "lucide-react";
import { memo, useMemo, type ReactNode } from "react";

const ProTable = ({
  data,
  pagination,
  setPagination,
  columns,
  isLoading = false,
  renderRow,
  isAdd = true,
  isDelete = true,
  isUpdate = true,
  isExport = true,
  isView = true,
  total,
}: {
  data: any;
  pagination: IParamsPagination;
  setPagination: (pagination: IParamsPagination) => void;
  isLoading?: boolean;
  columns: IColumn[];
  renderRow?: (item: any, key: string) => ReactNode;
  isAdd?: boolean;
  isUpdate?: boolean;
  isDelete?: boolean;
  isView?: boolean;
  isExport?: boolean;
  total: {
    page: number;
    records: number;
  };
}) => {
  const bottomContent = useMemo(() => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <span className="text-small text-default-400 w-[30%]">{`${total?.records || 0} items`}</span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={pagination.page || 1}
          total={total?.page || 1}
          onChange={(page) => setPagination({ ...pagination, page })}
        />
        <div className="hidden w-[30%] justify-end gap-2 sm:flex">
          <label className="text-default-400 text-small flex items-center">
            Rows per page:
            <select
              className="text-default-400 text-small bg-transparent outline-transparent outline-solid"
              //  onChange={onRowsPerPageChange}
              //  value={pagination.limit}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [pagination, setPagination, total]);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            {/* <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<SearchIcon />}
            variant="bordered"
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          /> */}
          </div>
          <div className="flex gap-3">
            {/* <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={(selectedKeys) => {
                  setVisibleColumns(new Set(selectedKeys));
                }}
              >
                {ResourceService.columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown> */}
            {isAdd && (
              <Button color="primary" endContent={<PlusIcon />}>
                Add New
              </Button>
            )}
            {isExport && (
              <Button color="secondary" endContent={<FileDown />}>
                Export
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }, [isAdd, isExport]);

  const columnsWithActions = useMemo(() => {
    const hasActionsColumn = columns.some((column) => column.uid === "actions");

    let updatedColumns = columns.map((column) => {
      if (column.uid === "actions") {
        return {
          ...column,
          align: "center",
        };
      }
      return column;
    });

    if (!hasActionsColumn) {
      updatedColumns = [
        ...updatedColumns,
        {
          name: "ACTIONS",
          uid: "actions",
          align: "center",
          sortable: false,
        },
      ];
    }

    return updatedColumns;
  }, [columns]);

  const setSortDescriptor = (sortDescriptor: SortDescriptor) => {
    setPagination({
      ...pagination,
      sortField: sortDescriptor.column.toString(),
      sortOrder: sortDescriptor.direction === "ascending" ? "asc" : "desc",
    });
  };

  return (
    <>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[382px]",
        }}
        sortDescriptor={{
          column: pagination.sortField || "id",
          direction: pagination.sortOrder === "asc" ? "ascending" : "descending",
        }}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={columnsWithActions}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No records found"} items={data || []} isLoading={isLoading}>
          {(item: any) => {
            return (
              <TableRow>
                {(columnKey: any) => {
                  if (columnKey.split(".").length > 1) {
                    return (
                      <TableCell>
                        {renderRow?.(item, columnKey) ||
                          item[columnKey.split(".")[0]][columnKey.split(".")[1]]}
                      </TableCell>
                    );
                  }
                  if (columnKey === "actions") {
                    return (
                      <TableCell width={80}>
                        <div className="flex items-center gap-2">
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <EllipsisVertical />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                              <>
                                {isView && <DropdownItem key="view">View</DropdownItem>}
                                {isUpdate && (
                                  <DropdownItem
                                    key="edit"
                                    onPress={() => {
                                      // setIsSelectRecord({
                                      //   id: item.id,
                                      //   name: item.name,
                                      //   createdAt: item.createdAt,
                                      //   updatedAt: item.updatedAt,
                                      //   description: item.description,
                                      // });
                                      // onOpen();
                                    }}
                                  >
                                    Edit
                                  </DropdownItem>
                                )}
                                {isDelete && (
                                  <DropdownItem
                                    key="delete"
                                    onPress={() => {
                                      // setIsSelectRecord({
                                      //   id: item.id,
                                      //   name: item.name,
                                      //   createdAt: item.createdAt,
                                      //   updatedAt: item.updatedAt,
                                      //   description: item.description,
                                      // });
                                      // onConfirmOpen();
                                    }}
                                    color="danger"
                                  >
                                    Delete
                                  </DropdownItem>
                                )}
                              </>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </TableCell>
                    );
                  }
                  return <TableCell>{renderRow?.(item, columnKey) || item[columnKey]}</TableCell>;
                }}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
      {/* <ModalCU
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={onClose}
        isSelectRecord={isSelectRecord!}
      />
      <ModalConfirm
        isSelectRecord={isSelectRecord!}
        isOpen={isConfirmOpen}
        onOpenChange={onConfirmOpenChange}
        onClose={onConfirmClose}
      /> */}
    </>
  );
};

export default memo(ProTable);
