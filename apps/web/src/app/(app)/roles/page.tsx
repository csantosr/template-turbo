"use client";

import { Star } from "@phosphor-icons/react";
import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui";
import { trpc } from "@/trpc/client";
import { CreateRoleDialog } from "./_components/create-role-dialog";
import { DeleteRoleDialog } from "./_components/delete-role-dialog";
import { EditPermissionsDialog } from "./_components/edit-permissions-dialog";
import { SetDefaultRoleDialog } from "./_components/set-default-role-dialog";

export default function RolesPage() {
  const { data: roles, isLoading } = trpc.rbac.listRoles.useQuery();
  const { data: myPerms } = trpc.rbac.myPermissions.useQuery();
  const permSet = new Set(myPerms ?? []);

  const canCreate = permSet.has("roles:create");
  const canUpdate = permSet.has("roles:update");
  const canDelete = permSet.has("roles:delete");

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-widest">
            Roles &amp; Permissions
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            Manage roles and the permissions they grant.
          </p>
        </div>
        {canCreate && <CreateRoleDialog />}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Permissions</TableHead>
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
          ) : !roles || roles.length === 0 ? (
            <TableRow>
              <TableCell className="py-12 text-center text-muted-foreground" colSpan={7}>
                No roles found. Run <code className="font-mono">pnpm db:seed:rbac</code> to seed
                defaults.
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <span className="font-mono text-sm font-bold uppercase tracking-widest">
                    {role.id}
                  </span>
                </TableCell>
                <TableCell className="font-bold">{role.name}</TableCell>
                <TableCell className="max-w-xs text-sm text-muted-foreground">
                  {role.description ?? "—"}
                </TableCell>
                <TableCell>
                  {role.isSystem ? (
                    <Badge variant="muted">System</Badge>
                  ) : (
                    <Badge variant="default">Custom</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {role.isDefault ? (
                    <Star weight="fill" size={20} className="text-yellow-500" />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm text-muted-foreground">
                    {role.permissions.length} permission{role.permissions.length !== 1 ? "s" : ""}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {canUpdate && !role.isDefault && (
                      <SetDefaultRoleDialog roleId={role.id} roleName={role.name} />
                    )}
                    {canUpdate && (
                      <EditPermissionsDialog
                        role={{
                          id: role.id,
                          name: role.name,
                          isSystem: role.isSystem,
                          permissions: role.permissions,
                        }}
                      />
                    )}
                    {canDelete && !role.isSystem && (
                      <DeleteRoleDialog roleId={role.id} roleName={role.name} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
