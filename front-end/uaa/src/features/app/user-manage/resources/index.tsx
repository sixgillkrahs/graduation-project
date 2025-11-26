import { useGetResources } from "./services/query";
import ResourceService from "./services/service";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table";
import { useMemo, useState } from "react";

const Resources = () => {
  const { data, isLoading } = useGetResources({
    page: 1,
    size: 10,
  });
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(ResourceService.INITIAL_VISIBLE_COLUMNS),
  );

  const headerColumns = useMemo(() => {
    if (visibleColumns.has("all")) return ResourceService.columns;

    return ResourceService.columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  return (
    <Table
      isHeaderSticky
      aria-label="Example table with custom cells, pagination and sorting"
      // bottomContent={bottomContent}
      // bottomContentPlacement="outside"
      // classNames={{
      //   wrapper: "max-h-[382px]",
      // }}
      // selectedKeys={selectedKeys}
      // selectionMode="multiple"
      // sortDescriptor={sortDescriptor}
      // topContent={topContent}
      // topContentPlacement="outside"
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
      <TableBody emptyContent={"No users found"} items={data?.data.results || []}>
        {(item) => {
          return <TableRow>{(columnKey) => <TableCell>{item[columnKey]}</TableCell>}</TableRow>;
        }}
      </TableBody>
    </Table>
    // <div></div>
  );
};

export default Resources;
