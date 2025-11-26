import { useGetResources, useGetResourcesByFilter } from "./services/query";
import ResourceService from "./services/service";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { toVietnamTime } from "@shared/render/time";
import { EllipsisVertical, PlusIcon, SearchIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const Resources = () => {
  const { data, isLoading } = useGetResources({
    page: 1,
    size: 10,
  });
  const [filterValue, setFilterValue] = useState("");
  const debouncedFilterValue = useDebouncedValue(filterValue, 500);
  const { data: filteredData, isLoading: isLoadingFilter } = useGetResourcesByFilter({
    page: 1,
    size: 10,
    query: debouncedFilterValue,
  });
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(ResourceService.INITIAL_VISIBLE_COLUMNS),
  );
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
  });

  const headerColumns = useMemo(() => {
    if (visibleColumns.has("all")) return ResourceService.columns;

    return ResourceService.columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const onPreviousPage = useCallback(() => {
    if (pagination.page > 1) {
      setPagination({
        ...pagination,
        page: pagination.page - 1,
      });
    }
  }, [pagination]);

  const onNextPage = useCallback(() => {
    if (pagination.page < (data?.data.totalPages || 0)) {
      setPagination({
        ...pagination,
        page: pagination.page + 1,
      });
    }
  }, [pagination, data?.data.totalPages]);

  const renderCell = useCallback((item: IResourceService.ResourceDTO, columnKey: string) => {
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
                <DropdownItem key="edit">Edit</DropdownItem>
                <DropdownItem key="delete">Delete</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

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
            <Button color="primary" endContent={<PlusIcon />}>
              Add New
            </Button>
          </div>
        </div>
      </div>
    );
  }, [filterValue, onClear]);

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
          <Button
            isDisabled={data?.data.page === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={data?.data.page === data?.data.totalPages}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [
    data?.data.page,
    data?.data.totalPages,
    data?.data.totalResults,
    onNextPage,
    onPreviousPage,
    pagination,
  ]);

  return (
    <Table
      isHeaderSticky
      aria-label="Example table with custom cells, pagination and sorting"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px]",
      }}
      // sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      // onSelectionChange={setSelectedKeys}
      // onSortChange={setSortDescriptor}
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
  );
};

export default Resources;
