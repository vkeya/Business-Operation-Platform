import { redirect } from "next/navigation";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { getAdminActivityDashboard } from "@/lib/admin/adminActivityService";

import AdminActivitySummary from "./components/AdminActivitySummary";
import RecentActivity from "./components/RecentActivity";
import ActivityLog from "./components/ActivityLog";

export default async function AdminPage() {
  const context = await getCurrentBusinessContext();

  try {
    await requireBusinessPermission(
      context.user.id,
      context.business.id,
      "audit.read",
    );
  } catch {
    redirect("/dashboard");
  }

  const dashboard =
    await getAdminActivityDashboard(
      context.business.id,
    );

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Platform activity, audit events and security activity.
        </p>
      </div>

      <AdminActivitySummary
        summary={dashboard.summary}
      />

      <RecentActivity
        events={dashboard.recentActivity}
      />

      <ActivityLog
        initialEvents={dashboard.activityLog.events}
        pagination={dashboard.activityLog.pagination}
      />
    </main>
  );
}