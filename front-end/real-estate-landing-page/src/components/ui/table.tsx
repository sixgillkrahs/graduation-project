"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

// ============================================================================
// Types & Interfaces
// ============================================================================

type TableColumn<T> = {
  title: React.ReactNode;
  dataIndex: keyof T;
  key?: string;
  width?: string | number;
  align?: "left" | "center" | "right";
  render?: (value: T[keyof T], record: T, index: number) => React.ReactNode;
};

type TablePagination = {
  current: number;
  pageSize: number;
  total: number;
  onChange?: (page: number, pageSize: number) => void;
};

type CsTableProps<T> = {
  columns: TableColumn<T>[];
  dataSource: T[];
  rowKey: keyof T | ((record: T) => string);
  loading?: boolean;
  pagination?: TablePagination | false;
  className?: string;
  emptyText?: React.ReactNode;
};

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

function CsTable<T>({
  columns,
  dataSource,
  rowKey,
  loading = false,
  pagination = false,
  className,
  emptyText = "No data",
}: CsTableProps<T>) {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === "function") {
      return rowKey(record);
    }
    return String(record[rowKey] ?? index);
  };

  const getAlignClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  const renderCell = (column: TableColumn<T>, record: T, index: number) => {
    const value = record[column.dataIndex];
    if (column.render) {
      return column.render(value, record, index);
    }
    return String(value ?? "");
  };

  // Pagination calculations
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 0;

  const handlePageChange = (page: number) => {
    if (pagination && pagination.onChange) {
      pagination.onChange(page, pagination.pageSize);
    }
  };

  const renderPagination = () => {
    if (!pagination || pagination.total === 0) return null;

    const { current, total, pageSize } = pagination;
    const startItem = (current - 1) * pageSize + 1;
    const endItem = Math.min(current * pageSize, total);

    // Generate page numbers to show
    const getPageNumbers = () => {
      const pages: (number | "ellipsis")[] = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible + 2) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        if (current > 3) pages.push("ellipsis");

        const start = Math.max(2, current - 1);
        const end = Math.min(totalPages - 1, current + 1);

        for (let i = start; i <= end; i++) pages.push(i);

        if (current < totalPages - 2) pages.push("ellipsis");
        pages.push(totalPages);
      }

      return pages;
    };

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-gray-500">
          Showing {startItem} to {endItem} of {total} results
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {getPageNumbers().map((page, idx) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                className={cn(
                  "min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition-colors",
                  current === page
                    ? "bg-gray-900 text-white"
                    : "hover:bg-gray-100 text-gray-700",
                )}
              >
                {page}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => handlePageChange(current + 1)}
            disabled={current === totalPages}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderSkeletonRows = () => {
    const skeletonCount = pagination ? pagination.pageSize : 5;
    return Array.from({ length: skeletonCount }).map((_, rowIndex) => (
      <TableRow key={`skeleton-${rowIndex}`}>
        {columns.map((column, colIndex) => (
          <TableCell
            key={`skeleton-cell-${rowIndex}-${colIndex}`}
            style={{ width: column.width }}
            className={getAlignClass(column.align)}
          >
            <Skeleton className="h-5 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div className={cn("rounded-lg border bg-white overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            {columns.map((column, index) => (
              <TableHead
                key={column.key ?? String(column.dataIndex) ?? index}
                style={{ width: column.width }}
                className={getAlignClass(column.align)}
              >
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            renderSkeletonRows()
          ) : dataSource.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-gray-500"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            dataSource.map((record, index) => (
              <TableRow key={getRowKey(record, index)}>
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={column.key ?? String(column.dataIndex) ?? colIndex}
                    style={{ width: column.width }}
                    className={getAlignClass(column.align)}
                  >
                    {renderCell(column, record, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {renderPagination()}
    </div>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  CsTable,
};

export type { TableColumn, TablePagination, CsTableProps };
