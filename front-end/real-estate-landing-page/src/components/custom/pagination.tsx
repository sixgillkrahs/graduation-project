"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import React, { useMemo, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────
export interface CsPaginationProps {
  /** Current page number (1-indexed) */
  current: number;
  /** Total number of data items */
  total: number;
  /** Number of items per page */
  pageSize?: number;
  /** Callback when page or pageSize changes */
  onChange?: (page: number, pageSize: number) => void;
  /** Show total count, e.g. "Total 85 items" */
  showTotal?:
    | boolean
    | ((total: number, range: [number, number]) => React.ReactNode);
  /** Show page size changer */
  showSizeChanger?: boolean;
  /** Available page sizes */
  pageSizeOptions?: number[];
  /** Callback when pageSize changes */
  onPageSizeChange?: (size: number) => void;
  /** Show quick jumper input */
  showQuickJumper?: boolean;
  /** Disable interaction */
  disabled?: boolean;
  /** Additional className for the container */
  className?: string;
  /** Simple mode: only prev/next, no page numbers */
  simple?: boolean;
}

// ─── Helper: generate page numbers with smart ellipsis ───────────
function generatePageNumbers(
  current: number,
  totalPages: number,
): (number | "ellipsis-start" | "ellipsis-end")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];

  // Always show first page
  pages.push(1);

  if (current <= 4) {
    // Near start: 1 2 3 4 5 ... last
    for (let i = 2; i <= 5; i++) pages.push(i);
    pages.push("ellipsis-end");
  } else if (current >= totalPages - 3) {
    // Near end: 1 ... n-4 n-3 n-2 n-1 last
    pages.push("ellipsis-start");
    for (let i = totalPages - 4; i <= totalPages - 1; i++) pages.push(i);
  } else {
    // Middle: 1 ... current-1 current current+1 ... last
    pages.push("ellipsis-start");
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push("ellipsis-end");
  }

  // Always show last page
  pages.push(totalPages);

  return pages;
}

// ─── Sub-components ──────────────────────────────────────────────

/** Individual page button */
const PageButton = ({
  page,
  isActive,
  disabled,
  onClick,
}: {
  page: number;
  isActive: boolean;
  disabled?: boolean;
  onClick: (page: number) => void;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onClick(page)}
    className={cn(
      "min-w-[32px] h-8 px-1.5 rounded-md text-sm font-medium transition-all duration-200 select-none",
      "outline-none focus-visible:ring-2 focus-visible:ring-red-500/40",
      isActive
        ? "cs-bg-red text-white shadow-sm shadow-red-200 hover:bg-red-700"
        : "text-gray-700 hover:bg-gray-100 hover:text-red-600",
      disabled && "opacity-50 pointer-events-none",
    )}
    aria-current={isActive ? "page" : undefined}
    aria-label={`Page ${page}`}
  >
    {page}
  </button>
);

/** Prev / Next arrow button */
const NavButton = ({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={cn(
      "flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200",
      "outline-none focus-visible:ring-2 focus-visible:ring-red-500/40",
      disabled
        ? "text-gray-300 cursor-not-allowed"
        : "text-gray-600 hover:bg-gray-100 hover:text-red-600",
    )}
    aria-label={direction === "prev" ? "Previous page" : "Next page"}
  >
    {direction === "prev" ? (
      <ChevronLeft className="w-4 h-4" />
    ) : (
      <ChevronRight className="w-4 h-4" />
    )}
  </button>
);

const Ellipsis = ({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled?: boolean;
  onClick: () => void;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200",
        "outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
        disabled
          ? "text-gray-300 cursor-not-allowed"
          : "text-gray-400 hover:text-emerald-600",
      )}
      aria-label={
        direction === "prev" ? "Jump 5 pages backward" : "Jump 5 pages forward"
      }
    >
      {hovered && !disabled ? (
        direction === "prev" ? (
          <span className="text-xs font-bold">«</span>
        ) : (
          <span className="text-xs font-bold">»</span>
        )
      ) : (
        <MoreHorizontal className="w-4 h-4" />
      )}
    </button>
  );
};

export const CsPagination = ({
  current,
  total,
  pageSize: pageSizeProp = 10,
  onChange,
  showTotal,
  showSizeChanger = false,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  showQuickJumper = false,
  disabled = false,
  className,
  simple = false,
}: CsPaginationProps) => {
  const [jumpValue, setJumpValue] = useState("");
  const [internalPageSize, setInternalPageSize] = useState(pageSizeProp);

  const pageSize = pageSizeProp ?? internalPageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safeCurrent = Math.min(Math.max(1, current), totalPages);

  const pages = useMemo(
    () => generatePageNumbers(safeCurrent, totalPages),
    [safeCurrent, totalPages],
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === safeCurrent || disabled)
      return;
    onChange?.(page, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    setInternalPageSize(newSize);
    onPageSizeChange?.(newSize);
    onChange?.(1, newSize);
  };

  const handleJump = () => {
    const page = parseInt(jumpValue, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page);
    }
    setJumpValue("");
  };

  // ─── Total info ─────────────────────────────────────────────
  const renderTotal = () => {
    if (!showTotal) return null;

    const start = (safeCurrent - 1) * pageSize + 1;
    const end = Math.min(safeCurrent * pageSize, total);

    if (typeof showTotal === "function") {
      return (
        <span className="text-sm text-gray-500 mr-4">
          {showTotal(total, [start, end])}
        </span>
      );
    }

    return (
      <span className="text-sm text-gray-500 mr-4">
        Total <span className="font-semibold text-gray-700">{total}</span> items
      </span>
    );
  };

  // ─── Simple mode ────────────────────────────────────────────
  if (simple) {
    return (
      <nav
        role="navigation"
        aria-label="Pagination"
        className={cn("flex items-center gap-2", className)}
      >
        <NavButton
          direction="prev"
          disabled={disabled || safeCurrent <= 1}
          onClick={() => handlePageChange(safeCurrent - 1)}
        />
        <span className="text-sm text-gray-700 font-medium tabular-nums">
          {safeCurrent}
          <span className="text-gray-400 mx-1">/</span>
          {totalPages}
        </span>
        <NavButton
          direction="next"
          disabled={disabled || safeCurrent >= totalPages}
          onClick={() => handlePageChange(safeCurrent + 1)}
        />
      </nav>
    );
  }

  // ─── Full mode ──────────────────────────────────────────────
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn(
        "flex flex-wrap items-center gap-1.5",
        disabled && "opacity-60 pointer-events-none",
        className,
      )}
    >
      {/* Total display */}
      {renderTotal()}

      {/* Prev button */}
      <NavButton
        direction="prev"
        disabled={disabled || safeCurrent <= 1}
        onClick={() => handlePageChange(safeCurrent - 1)}
      />

      {/* Page numbers */}
      {pages.map((item, index) => {
        if (item === "ellipsis-start") {
          return (
            <Ellipsis
              key="ellipsis-start"
              direction="prev"
              disabled={disabled}
              onClick={() => handlePageChange(Math.max(1, safeCurrent - 5))}
            />
          );
        }

        if (item === "ellipsis-end") {
          return (
            <Ellipsis
              key="ellipsis-end"
              direction="next"
              disabled={disabled}
              onClick={() =>
                handlePageChange(Math.min(totalPages, safeCurrent + 5))
              }
            />
          );
        }

        return (
          <PageButton
            key={item}
            page={item}
            isActive={item === safeCurrent}
            disabled={disabled}
            onClick={handlePageChange}
          />
        );
      })}

      <NavButton
        direction="next"
        disabled={disabled || safeCurrent >= totalPages}
        onClick={() => handlePageChange(safeCurrent + 1)}
      />

      {showSizeChanger && (
        <select
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          disabled={disabled}
          className={cn(
            "ml-2 h-8 rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700",
            "outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
            "transition-all duration-200 cursor-pointer",
            disabled && "cursor-not-allowed opacity-50",
          )}
          aria-label="Items per page"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      )}

      {/* Quick jumper */}
      {showQuickJumper && (
        <div className="ml-2 flex items-center gap-1.5 text-sm text-gray-600">
          <span>Go to</span>
          <input
            type="text"
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleJump()}
            onBlur={handleJump}
            disabled={disabled}
            className={cn(
              "w-12 h-8 rounded-md border border-gray-200 bg-white px-2 text-center text-sm",
              "outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
              "transition-all duration-200 tabular-nums",
              disabled && "cursor-not-allowed opacity-50",
            )}
            aria-label="Jump to page"
          />
        </div>
      )}
    </nav>
  );
};
