import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Sidebar from "@/components/Sidebar";
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
      <Sidebar storeUrl={session.credentials?.url} />
      <main className="ml-64 p-8">
        <DashboardWrapper>{children}</DashboardWrapper>
      </main>
    </div>
  );
}
