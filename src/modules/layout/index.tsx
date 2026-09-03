import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutNavbar } from "./components/navbar";
import { LayoutSidebar } from "./components/sidebar";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { Loader2Icon } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  const queryClient = getQueryClient();
  return (
    <SidebarProvider>
      <div className="w-full">
        <LayoutNavbar />
        <div className="flex min-h-screen pt-16">
          <LayoutSidebar />
          <main className="flex-1 overflow-y-auto">
            <HydrationBoundary state={dehydrate(queryClient)}>
              <ErrorBoundary fallback={<p>Something went wrong</p>}>
                <Suspense
                  fallback={
                    <p className="flex justify-center">
                      <Loader2Icon className="animate-spin size-4" />
                    </p>
                  }
                >
                  {children}
                </Suspense>
              </ErrorBoundary>
            </HydrationBoundary>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
