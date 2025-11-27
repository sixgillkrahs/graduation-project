import ModalCU from "./components/ModalCU";
import ModalConfirm from "./components/ModalConfirm";
import { useGetResources, useGetResourcesByFilter } from "./services/query";
import ResourceService from "./services/service";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Input } from "@heroui/input";
import { useDisclosure } from "@heroui/modal";
import { Pagination } from "@heroui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  type Selection,
  type SortDescriptor,
} from "@heroui/table";
import { toVietnamTime } from "@shared/render/time";
import type { IParamsPagination } from "@shared/types/service";
import { capitalize } from "lodash";
import { ChevronDownIcon, EllipsisVertical, PlusIcon, SearchIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const Resources = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const {
    isOpen: isConfirmOpen,
    onOpenChange: onConfirmOpenChange,
    onClose: onConfirmClose,
    onOpen: onConfirmOpen,
  } = useDisclosure();
  const [filterValue, setFilterValue] = useState("");
  const [isSelectRecord, setIsSelectRecord] = useState<IResourceService.ResourceDTO | null>(null);
  const debouncedFilterValue = useDebouncedValue(filterValue, 500);
  const [pagination, setPagination] = useState<IParamsPagination>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading } = useGetResources({
    page: pagination.page,
    limit: pagination.limit,
    sortBy: pagination?.sortBy,
    sortOrder: pagination?.sortOrder,
  });
  const { data: filteredData, isLoading: isLoadingFilter } = useGetResourcesByFilter({
    page: pagination.page,
    limit: pagination.limit,
    query: debouncedFilterValue,
  });
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(ResourceService.INITIAL_VISIBLE_COLUMNS),
  );

  const headerColumns = useMemo(() => {
    if (visibleColumns == "all") return ResourceService.columns;

    return ResourceService.columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newLimit = Number(e.target.value);
      setPagination({
        ...pagination,
        page: 1,
        limit: newLimit,
      });
    },
    [pagination],
  );

  const renderCell = useCallback(
    (item: IResourceService.ResourceDTO, columnKey: string) => {
      const cellValue = item[columnKey as keyof IResourceService.ResourceDTO];
      switch (columnKey) {
        case "createdAt":
          return <span>{toVietnamTime(cellValue)}</span>;
        case "updatedAt":
          return <span>{toVietnamTime(cellValue)}</span>;
        case "action":
          return (
            <div className="flex items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <EllipsisVertical />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem key="view">View</DropdownItem>
                  <DropdownItem
                    key="edit"
                    onPress={() => {
                      setIsSelectRecord({
                        id: item.id,
                        name: item.name,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                        description: item.description,
                      });
                      onOpen();
                    }}
                  >
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    onPress={() => {
                      setIsSelectRecord({
                        id: item.id,
                        name: item.name,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                        description: item.description,
                      });
                      onConfirmOpen();
                    }}
                    color="danger"
                  >
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [onConfirmOpen, onOpen],
  );

  const onClear = useCallback(() => {
    setFilterValue("");
    setPagination({
      ...pagination,
      page: 1,
    });
  }, [pagination]);

  const onSearchChange = (value?: string) => {
    if (value) {
      setFilterValue(value);
    } else {
      setFilterValue("");
    }
  };

  const setSortDescriptor = (sortDescriptor: SortDescriptor) => {
    setPagination({
      ...pagination,
      sortBy: sortDescriptor.column.toString(),
      sortOrder: sortDescriptor.direction === "ascending" ? "asc" : "desc",
    });
  };

  const handleAddNew = useCallback(() => {
    setIsSelectRecord(null);
    onOpen();
  }, [onOpen]);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<SearchIcon />}
            variant="bordered"
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
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
            </Dropdown>
            <Button onPress={handleAddNew} color="primary" endContent={<PlusIcon />}>
              Add New
            </Button>
          </div>
        </div>
      </div>
    );
  }, [filterValue, onClear, visibleColumns, handleAddNew]);

  const bottomContent = useMemo(() => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <span className="text-small text-default-400 w-[30%]">
          {`${data?.data.totalResults || 0} items`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={data?.data.page || 1}
          total={data?.data.totalPages || 1}
          onChange={(page) => setPagination({ ...pagination, page })}
        />
        <div className="hidden w-[30%] justify-end gap-2 sm:flex">
          <label className="text-default-400 text-small flex items-center">
            Rows per page:
            <select
              className="text-default-400 text-small bg-transparent outline-transparent outline-solid"
              onChange={onRowsPerPageChange}
              value={pagination.limit}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    data?.data.page,
    data?.data.totalPages,
    data?.data.totalResults,
    pagination,
    onRowsPerPageChange,
  ]);

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
          column: pagination.sortBy || "id",
          direction: pagination.sortOrder === "asc" ? "ascending" : "descending",
        }}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
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
        <TableBody
          emptyContent={"No users found"}
          items={debouncedFilterValue ? filteredData?.data.results || [] : data?.data.results || []}
          isLoading={debouncedFilterValue ? isLoadingFilter : isLoading}
        >
          {(item) => {
            return (
              <TableRow>
                {(columnKey: any) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
      <ModalCU
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
      />
    </>
  );
};

export default Resources;
