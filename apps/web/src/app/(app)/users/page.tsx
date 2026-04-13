"use client";

import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
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
import { useEffect, useState } from "react";
import { trpc } from "@/trpc/client";
import { BanUserDialog } from "./_components/ban-user-dialog";
import { ImpersonateUserDialog } from "./_components/impersonate-user-dialog";
import { InviteUserDialog } from "./_components/invite-user-dialog";
import { RemoveUserDialog } from "./_components/remove-user-dialog";
import { ResendVerificationDialog } from "./_components/resend-verification-dialog";
import { ResetPasswordDialog } from "./_components/reset-password-dialog";
import { RestoreUserDialog } from "./_components/restore-user-dialog";
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
  deletedAt: string | Date | null;
}

const PAGE_SIZE = 20;

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedPage, setDeletedPage] = useState(1);

  const { data: me } = trpc.user.me.useQuery();
  const currentUserId = me?.id;

  const { data: myPerms } = trpc.rbac.myPermissions.useQuery();
  const permSet = new Set(myPerms ?? []);
  const canInvite = permSet.has("users:create");
  const canUpdate = permSet.has("users:update");
  const canDelete = permSet.has("users:delete");
  const canManageRoles = permSet.has("roles:assign");
  const canBan = permSet.has("users:ban");
  const canReadDeletions = permSet.has("userDeletions:read");
  const canRestore = permSet.has("userDeletions:restore");
  const canImpersonate = permSet.has("users:impersonate");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = trpc.user.list.useQuery({
    search: debouncedSearch || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: deletedData, isLoading: deletedLoading } = trpc.user.listDeleted.useQuery(
    {
      search: debouncedSearch || undefined,
      page: deletedPage,
      pageSize: PAGE_SIZE,
    },
    { enabled: showDeleted },
  );

  const users = (data?.users ?? []) as unknown as UserRow[];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const deletedUsers = (deletedData?.users ?? []) as unknown as UserRow[];
  const deletedTotal = deletedData?.total ?? 0;
  const deletedTotalPages = Math.max(1, Math.ceil(deletedTotal / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs rounded-none border-2 border-border bg-background font-mono text-sm uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground focus-visible:ring-0"
        />
        {canInvite && <InviteUserDialog />}
      </div>

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
              <TableCell className="py-12 text-center text-muted-foreground" colSpan={7}>
                Loading...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell className="py-12 text-center text-muted-foreground" colSpan={7}>
                No users found.
              </TableCell>
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
                        <span
                          key={r.id}
                          className="border border-border px-1.5 py-0.5 font-mono text-xs uppercase tracking-widest text-muted-foreground"
                        >
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
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-4">
                    {user.id === currentUserId && <Badge variant="muted">myself</Badge>}
                    {canImpersonate && user.id !== currentUserId && (
                      <ImpersonateUserDialog
                        userId={user.id}
                        userName={user.name}
                        userEmail={user.email}
                      />
                    )}
                    {canUpdate && !user.emailVerified && user.id !== currentUserId && (
                      <ResendVerificationDialog
                        userId={user.id}
                        userName={user.name}
                        userEmail={user.email}
                      />
                    )}
                    {canUpdate && user.id !== currentUserId && (
                      <ResetPasswordDialog
                        userId={user.id}
                        userName={user.name}
                        userEmail={user.email}
                      />
                    )}
                    {canManageRoles && user.id !== currentUserId && (
                      <UserRbacDialog
                        userId={user.id}
                        userName={user.name}
                        userEmail={user.email}
                      />
                    )}
                    {canBan && !user.banned && user.id !== currentUserId && (
                      <BanUserDialog userId={user.id} userName={user.name} userEmail={user.email} />
                    )}
                    {canBan && user.banned && user.id !== currentUserId && (
                      <UnbanUserDialog
                        userId={user.id}
                        userName={user.name}
                        userEmail={user.email}
                      />
                    )}
                    {canDelete && user.id !== currentUserId && (
                      <RemoveUserDialog
                        userId={user.id}
                        userName={user.name}
                        userEmail={user.email}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <p className="font-mono text-sm text-muted-foreground">
          {total} user{total !== 1 ? "s" : ""} total
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

      {canReadDeletions && (
        <div className="flex flex-col gap-4 border-t-2 border-border pt-6">
          <button
            type="button"
            onClick={() => setShowDeleted((s) => !s)}
            className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            {showDeleted ? (
              <CaretUpIcon weight="bold" size={14} />
            ) : (
              <CaretDownIcon weight="bold" size={14} />
            )}
            Deletions
          </button>

          {showDeleted && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Deleted At</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedLoading ? (
                    <TableRow>
                      <TableCell className="py-12 text-center text-muted-foreground" colSpan={5}>
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : deletedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell className="py-12 text-center text-muted-foreground" colSpan={5}>
                        No deleted users.
                      </TableCell>
                    </TableRow>
                  ) : (
                    deletedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-bold">{user.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.deletedAt
                            ? new Date(user.deletedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          {canRestore && (
                            <RestoreUserDialog
                              userId={user.id}
                              userName={user.name}
                              userEmail={user.email}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {deletedTotalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm text-muted-foreground">
                    {deletedTotal} deleted user{deletedTotal !== 1 ? "s" : ""} total
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setDeletedPage((p) => Math.max(1, p - 1))}
                      disabled={deletedPage === 1}
                      className="font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    >
                      ← Prev
                    </button>
                    <span className="font-mono text-sm text-muted-foreground">
                      {deletedPage} / {deletedTotalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDeletedPage((p) => Math.min(deletedTotalPages, p + 1))}
                      disabled={deletedPage === deletedTotalPages}
                      className="font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
