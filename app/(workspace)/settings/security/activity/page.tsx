import { redirect } from "next/navigation";

import { getCurrentBusinessContext } from "@/lib/business/currentBusiness";
import { requireBusinessPermission } from "@/lib/business/businessPermissionService";
import { getAdminActivityDashboard } from "@/lib/admin/adminActivityService";

import AdminActivitySummary from "@/app/(workspace)/admin/components/AdminActivitySummary";
import RecentActivity from "@/app/(workspace)/admin/components/RecentActivity";
import ActivityLog from "@/app/(workspace)/admin/components/ActivityLog";

export const dynamic = "force-dynamic";

export default async function ActivityAuditPage() {
  const context = await getCurrentBusinessContext();

  try {
    await requireBusinessPermission(
      context.user.id,
      context.business.id,
      "audit.read",
    );
  } catch {
    redirect("/settings");
  }

  const dashboard = await getAdminActivityDashboard(
    context.business.id,
  );

  return (
    <main className="space-y-6">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Security & Access
        </div>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Activity & Audit
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Review activity, security events, operational changes,
          and audit history for this business.
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
