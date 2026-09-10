import { redirect } from "next/navigation";

import { auth } from "@/auth";

import Header from "@/components/Header";
import { AppSidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) return redirect("/signin");

  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <main className="w-full">
        <Header />
        <div className="mx-5 mb-5">{children}</div>
      </main>
    </SidebarProvider>
  );
}
