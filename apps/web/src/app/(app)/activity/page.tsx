"use client";

import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { type ActivityFilter, ActivityFilters } from "./_components/activity-filters";

const PAGE_SIZE = 20;

export default function ActivityPage() {
  const [filter, setFilter] = useState<ActivityFilter>("ALL");
  const [page, setPage] = useState(1);

  const action = filter === "ALL" || filter === "FAILED" ? undefined : filter;
  const status = filter === "FAILED" ? "failed" : undefined;

  const { data, isLoading } = trpc.activity.list.useQuery({
    action,
    status,
    page,
    pageSize: PAGE_SIZE,
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleFilter(f: ActivityFilter) {
    setFilter(f);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <ActivityFilters value={filter} onChange={handleFilter} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Detail</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell className="py-12 text-center text-muted-foreground" colSpan={5}>
                Loading...
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell className="py-12 text-center text-muted-foreground" colSpan={5}>
                No events match this filter.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(a.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-sm">{a.userEmail ?? "—"}</TableCell>
                <TableCell>
                  <span className="font-mono text-sm font-bold uppercase tracking-widest">
                    {a.action}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{a.detail ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={a.status === "success" ? "success" : "destructive"}>
                    {a.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <p className="font-mono text-sm text-muted-foreground">
          {total} event{total !== 1 ? "s" : ""} total
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="font-mono text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
