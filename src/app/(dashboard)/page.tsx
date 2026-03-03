import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-gray-600">Welcome back!</p>
        </div>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Leads" value="0" />
        <StatCard title="Clients" value="0" />
        <StatCard title="Hours This Week" value="0" />
        <StatCard title="Pending Invoices" value="$0" />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction href="/leads/new" title="Add Lead" />
          <QuickAction href="/clients/new" title="Add Client" />
          <QuickAction href="/time" title="Start Timer" />
          <QuickAction href="/invoices/new" title="Create Invoice" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
        <p className="text-gray-500">No recent activity yet.</p>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function QuickAction({ href, title }: { href: string; title: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-center rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-200"
    >
      {title}
    </a>
  );
}
