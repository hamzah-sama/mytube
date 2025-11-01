import { SidebarProvider } from "@/components/ui/sidebar";
import { StudioNavbar } from "../components/studio-navbar";
import { StudioSidebar } from "../components/studio-sidebar";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

interface Props {
  children: React.ReactNode;
}

const StudioLayout = async ({ children }: Props) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <SidebarProvider>
      <div className="w-full">
        <StudioNavbar />
        <div className="flex min-h-screen pt-16">
          <StudioSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StudioLayout;

const SidebarSkeleton = () => {
  return <div>Skeleton</div>;
};
