import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import DashboardWrapper from "@/components/DashboardWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar storeUrl={session.credentials?.url} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar storeUrl={session.credentials?.url} />

      {/* Main Content - responsive margins */}
      <main className="lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <DashboardWrapper>{children}</DashboardWrapper>
      </main>
    </div>
  );
}
