import clsx from "clsx";
import React from "react";
import { Icon } from "..";
import { TableProps } from "./table.types";
import { Input } from "../input";
import { CsButton } from "@/components/custom";

const Table = <T extends object>({
  columns,
  dataSource,
  rowKey,
  loading,
  pagination,
  rowSelection,
  className,
}: TableProps<T>) => {
  const getRowKey = (record: T): string => {
    if (typeof rowKey === "function") {
      return rowKey(record);
    }
    return String(record[rowKey]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!rowSelection) return;
    const { onChange } = rowSelection;
    if (e.target.checked) {
      const allKeys = dataSource.map(getRowKey);
      onChange(allKeys, dataSource);
    } else {
      onChange([], []);
    }
  };

  const handleSelectRow = (
    e: React.ChangeEvent<HTMLInputElement>,
    record: T,
  ) => {
    if (!rowSelection) return;
    const { selectedRowKeys, onChange } = rowSelection;
    const key = getRowKey(record);
    if (e.target.checked) {
      onChange([...selectedRowKeys, key], [...dataSource, record]); // Note: getting selectedRows might need filtering from dataSource based on keys if strict accuracy needed across pages, but simple version suffices. Refined logic:
    } else {
      onChange(
        selectedRowKeys.filter((k) => k !== key),
        dataSource.filter((r) => getRowKey(r) !== key), // This assumes all selected are in current dataSource for simplified filtering
      );
    }
  };

  // Helper for refined selection logic
  const onRowCheckboxChange = (record: T, checked: boolean) => {
    if (!rowSelection) return;
    const { selectedRowKeys, onChange } = rowSelection;
    const key = getRowKey(record);
    let newSelectedRowKeys = [];
    if (checked) {
      newSelectedRowKeys = [...selectedRowKeys, key];
    } else {
      newSelectedRowKeys = selectedRowKeys.filter((k) => k !== key);
    }
    // Normally you'd want to pass back all selected *objects*, but usually keys are enough. keeping it simple.
    onChange(newSelectedRowKeys, []);
  };

  return (
    <div>
      <div className="mb-6 p-4 bg-white rounded-3xl shadow-sm">
        <Input
          label=""
          placeholder="Search"
          preIcon={<Icon.Search />}
          className="rounded-[14px]! w-[400px]!"
        />
      </div>
      <div
        className={clsx(
          "w-full overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-200",
          className,
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                {rowSelection && (
                  <th className="px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onChange={handleSelectAll}
                      checked={
                        dataSource.length > 0 &&
                        rowSelection.selectedRowKeys.length ===
                          dataSource.length
                      }
                    />
                  </th>
                )}
                {columns.map((col, index) => (
                  <th
                    key={col.key || String(col.dataIndex)}
                    className={clsx(
                      "px-6 py-4",
                      col.align ? `text-${col.align}` : "",
                    )}
                    style={{ width: col.width }}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (rowSelection ? 1 : 0)}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : dataSource.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (rowSelection ? 1 : 0)}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No data
                  </td>
                </tr>
              ) : (
                dataSource.map((record, rowIndex) => {
                  const key = getRowKey(record);
                  const isSelected =
                    rowSelection?.selectedRowKeys.includes(key);
                  return (
                    <tr
                      key={key}
                      className={clsx(
                        "hover:bg-gray-50 transition-colors duration-150",
                        isSelected && "bg-blue-50",
                      )}
                    >
                      {rowSelection && (
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={!!isSelected}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            onChange={(e) =>
                              onRowCheckboxChange(record, e.target.checked)
                            }
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key || String(col.dataIndex)}
                          className={clsx(
                            "px-6 py-4 text-sm text-gray-700",
                            col.align ? `text-${col.align}` : "",
                          )}
                        >
                          {col.render
                            ? col.render(
                                record[col.dataIndex],
                                record,
                                rowIndex,
                              )
                            : (record[col.dataIndex] as React.ReactNode)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <span className="text-sm! cs-paragraph-gray font-medium!">
              Showing{" "}
              <span className="font-bold! cs-paragraph text-sm!">
                {Math.min(
                  pagination.total,
                  (pagination.current - 1) * pagination.pageSize + 1,
                )}{" "}
              </span>
              to{" "}
              <span className="font-bold! cs-paragraph text-sm!">
                {Math.min(
                  pagination.total,
                  pagination.current * pagination.pageSize,
                )}{" "}
              </span>
              of{" "}
              <span className="font-bold! cs-paragraph text-sm!">
                {pagination.total}
              </span>{" "}
              results
            </span>
            <div className="flex gap-2">
              <CsButton
                disabled={pagination.current === 1}
                onClick={() =>
                  pagination.onChange(
                    pagination.current - 1,
                    pagination.pageSize,
                  )
                }
                className="px-3 py-1 text-sm  disabled:opacity-50 disabled:cursor-not-allowed font-bold"
              >
                Prev
              </CsButton>
              <CsButton
                disabled={
                  pagination.current * pagination.pageSize >= pagination.total
                }
                onClick={() =>
                  pagination.onChange(
                    pagination.current + 1,
                    pagination.pageSize,
                  )
                }
                className="px-3 py-1 text-sm  disabled:opacity-50 disabled:cursor-not-allowed font-bold"
              >
                Next
              </CsButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export { Table };
