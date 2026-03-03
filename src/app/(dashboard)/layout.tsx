import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock,
  FileText,
  Settings,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leads", label: "Leads", icon: UserPlus },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/time", label: "Time", icon: Clock },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white">
        <div className="border-b p-4">
          <h1 className="text-xl font-bold">SoloStack</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {/* Mobile header */}
        <header className="md:hidden border-b bg-white p-4">
          <h1 className="text-lg font-bold">SoloStack</h1>
        </header>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white">
          <ul className="flex justify-around py-2">
            {navItems.slice(0, 5).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex flex-col items-center gap-1 px-3 py-2 text-xs text-gray-600"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 md:p-8 pb-20 md:pb-8">{children}</div>
      </main>
    </div>
  );
}
