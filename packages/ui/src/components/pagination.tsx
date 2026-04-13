"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ className, page, pageCount, onPageChange, ...props }: PaginationProps) => {
  const pages = React.useMemo(() => {
    const delta = 2;
    const range: (number | "...")[] = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(pageCount - 1, page + delta); i++) {
      range.push(i);
    }
    if (page - delta > 2) range.unshift("...");
    if (page + delta < pageCount - 1) range.push("...");
    range.unshift(1);
    if (pageCount > 1) range.push(pageCount);
    return range;
  }, [page, pageCount]);

  return (
    <nav
      className={cn("flex items-center gap-1 font-mono text-sm", className)}
      aria-label="Pagination"
      {...props}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="h-8 w-8"
      >
        <CaretLeft size={14} weight="bold" />
      </Button>

      {pages.map((p) =>
        p === "..." ? (
          <span key="ellipsis" className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={`page-${p}`}
            variant={page === p ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(p as number)}
            aria-label={`Page ${p}`}
            aria-current={page === p ? "page" : undefined}
            className="h-8 w-8"
          >
            {p}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
        className="h-8 w-8"
      >
        <CaretRight size={14} weight="bold" />
      </Button>
    </nav>
  );
};

export { Pagination };
