import { redirect } from "next/navigation";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { listAdminUsers } from "@/lib/admin/adminUserService";

import UserList from "./components/UserList";

export default async function AdminUsersPage() {
  const context = await getCurrentBusinessContext();

  try {
    await requireBusinessPermission(
      context.user.id,
      context.business.id,
      "users.read",
    );
  } catch {
    redirect("/dashboard");
  }

  const users = await listAdminUsers();

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Users
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage users, business access and roles.
        </p>
      </div>

      <UserList users={users} />
    </main>
  );
}