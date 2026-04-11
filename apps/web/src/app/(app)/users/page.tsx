"use client";

import {
  Badge,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { trpc } from "@/trpc/client";
import { useEffect, useState } from "react";
import { BanUserDialog } from "./_components/ban-user-dialog";
import { InviteUserDialog } from "./_components/invite-user-dialog";
import { RemoveUserDialog } from "./_components/remove-user-dialog";
import { ResendVerificationDialog } from "./_components/resend-verification-dialog";
import { ResetPasswordDialog } from "./_components/reset-password-dialog";
import { UnbanUserDialog } from "./_components/unban-user-dialog";
import { UserRbacDialog } from "./_components/user-rbac-dialog";

interface UserRow {
  id: string;
  name: string;
  email: string;
  roles: { id: string; name: string }[];
  banned: boolean | null;
  banReason: string | null;
  emailVerified: boolean;
  createdAt: string | Date;
}

const PAGE_SIZE = 20;

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: myPerms } = trpc.rbac.myPermissions.useQuery();
  const permSet = new Set(myPerms ?? []);
  const canInvite = permSet.has("users:create");
  const canUpdate = permSet.has("users:update");
  const canDelete = permSet.has("users:delete");
  const canManageRoles = permSet.has("roles:assign");
  const canBan = permSet.has("users:ban");

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = trpc.user.list.useQuery({
    search: debouncedSearch || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const users = (data?.users ?? []) as unknown as UserRow[];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs rounded-none border-2 border-border bg-background font-mono text-sm uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground focus-visible:ring-0"
        />
        {canInvite && <InviteUserDialog />}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Banned</TableHead>
            <TableHead>Email Verified</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell className="py-12 text-center text-muted-foreground" colSpan={7}>Loading...</TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell className="py-12 text-center text-muted-foreground" colSpan={7}>No users found.</TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-bold">{user.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  {user.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((r) => (
                        <span key={r.id} className="border border-border px-1.5 py-0.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          {r.id}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {user.banned ? (
                    <span title={user.banReason ?? undefined}>
                      <Badge variant="destructive">BANNED</Badge>
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={user.emailVerified ? "success" : "muted"}>
                    {user.emailVerified ? "verified" : "unverified"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-4">
                    {canUpdate && !user.emailVerified && (
                      <ResendVerificationDialog userId={user.id} userName={user.name} userEmail={user.email} />
                    )}
                    {canUpdate && (
                      <ResetPasswordDialog userId={user.id} userName={user.name} userEmail={user.email} />
                    )}
                    {canManageRoles && (
                      <UserRbacDialog userId={user.id} userName={user.name} userEmail={user.email} />
                    )}
                    {canBan && !user.banned && (
                      <BanUserDialog userId={user.id} userName={user.name} userEmail={user.email} />
                    )}
                    {canBan && user.banned && (
                      <UnbanUserDialog userId={user.id} userName={user.name} userEmail={user.email} />
                    )}
                    {canDelete && (
                      <RemoveUserDialog userId={user.id} userName={user.name} userEmail={user.email} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-sm text-muted-foreground">
          {total} user{total !== 1 ? "s" : ""} total
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="font-mono text-sm text-muted-foreground">{page} / {totalPages}</span>
            <button
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
